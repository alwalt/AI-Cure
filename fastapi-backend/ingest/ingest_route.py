import os
import time
import tempfile
from io import BytesIO
from pathlib import Path
from typing import List

import pandas as pd
from fastapi import File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.chat_models import ChatOllama
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate

# PowerPoint processing imports
from pptx import Presentation
import pytesseract
from PIL import Image, ImageDraw, ImageFont
from docx import Document as DocxDocument

# Import from their original locations
from utils import clean_dataframe
from config.shared import SESSIONS, initialize_session, chroma_settings, hnsw_metadata


def extract_text_from_pptx(pptx_file_path):
    """
    Extract text from PPTX slides using OCR on generated images.
    """
    prs = Presentation(pptx_file_path)
    all_text = ""
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        for i, slide in enumerate(prs.slides):
            # Extract text from slide shapes first
            slide_text = ""
            for shape in slide.shapes:
                if shape.has_text_frame:
                    for paragraph in shape.text_frame.paragraphs:
                        for run in paragraph.runs:
                            slide_text += run.text + " "
                    slide_text += "\n"
                elif shape.has_table:
                    for row in shape.table.rows:
                        slide_text += "\t".join(cell.text for cell in row.cells) + "\n"
            
            # Create image from extracted text
            image = Image.new("RGB", (1024, 768), "white")
            draw = ImageDraw.Draw(image)
            
            try:
                font = ImageFont.truetype("arial.ttf", 20)
            except IOError:
                font = ImageFont.load_default()
            
            current_y = 10
            for line in slide_text.split("\n"):
                draw.text((10, current_y), line, fill="black", font=font)
                current_y += 25
            
            # Save image and apply OCR
            image_path = temp_path / f"slide_{i + 1}.png"
            image.save(image_path)
            
            try:
                img = Image.open(image_path).convert("RGB")
                ocr_text = pytesseract.image_to_string(img)
                if ocr_text.strip():
                    all_text += f"--- Slide {i + 1} ---\n"
                    all_text += ocr_text.strip() + "\n\n"
            except Exception as e:
                all_text += f"[OCR error on slide {i + 1}: {e}]\n"
    
    return all_text.strip()


def process_pptx_file(file_content, filename):
    """
    Process a single PPTX file using OCR-based text extraction.
    """
    docs = []
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as tmp:
        tmp.write(file_content)
        tmp_path = tmp.name

    try:
        text = extract_text_from_pptx(tmp_path)
        
        if text.strip():
            # Split by slides and create separate documents for each slide
            slides = text.split("--- Slide ")
            for i, slide_content in enumerate(slides):
                if slide_content.strip():
                    # Clean up slide content
                    if slide_content.startswith("1 ---"):
                        slide_content = slide_content[5:]  # Remove "1 ---" from first slide
                    elif " ---" in slide_content:
                        slide_content = slide_content.split(" ---", 1)[1]
                    
                    slide_content = slide_content.strip()
                    if slide_content:
                        metadata = {
                            "source": filename,
                            "filetype": ".pptx",
                            "slide_number": i + 1
                        }
                        doc = Document(page_content=slide_content, metadata=metadata)
                        docs.append(doc)
    
    except Exception as e:
        print(f"Error processing PPTX {filename} with OCR: {e}")
    
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
    
    return docs


def process_docx_file(file_content, filename):
    """
    Process a single DOCX file and return Document objects.
    """
    docs = []
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
        tmp.write(file_content)
        tmp_path = tmp.name

    try:
        doc = DocxDocument(tmp_path)
        full_text = ""
        for para in doc.paragraphs:
            full_text += para.text + "\n"
        
        if full_text.strip():
            metadata = {
                "source": filename,
                "filetype": ".docx"
            }
            document = Document(page_content=full_text.strip(), metadata=metadata)
            docs.append(document)
    
    except Exception as e:
        print(f"Error processing DOCX {filename}: {e}")
    
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
    
    return docs


async def ingest_collection(
    request: Request,
    files: List[UploadFile] = File(...),
    collection_id: str = Form(...),
    collection_name: str = Form(...),
    embedding_model: str = Form("sentence-transformers/all-MiniLM-L6-v2"),
):
    """
    Create a new vectorstore for a specific collection.
    Each collection gets its own isolated vectorstore.
    """
    session_id = request.state.session_id
    
    # Initialize session if needed
    initialize_session(session_id)
    
    # Import USER_DIRS here to avoid circular imports
    from file_handlers.file_tools import USER_DIRS
    
    # Create collection-specific directory
    collection_dir = os.path.join(USER_DIRS, session_id, "collections", collection_id)
    os.makedirs(collection_dir, exist_ok=True)
    
    # Process files and create documents
    all_docs = []
    file_info_list = []
    
    for upload in files:
        ext = Path(upload.filename).suffix.lower()
        metadata = {"source": upload.filename, "filetype": ext}
        
        # Store file info for frontend
        file_info = {
            "name": upload.filename,
            "type": ext.lstrip('.'), 
            "size": upload.size if hasattr(upload, 'size') else 0,
            "dateCreated": time.strftime("%m/%d/%Y")
        }
        file_info_list.append(file_info)
        file_content = await upload.read()
        
        # Handle different file types
        if ext == ".csv":
            df = pd.read_csv(BytesIO(file_content))
            df = clean_dataframe(df)
            for _, row in df.iterrows():
                text = ", ".join(f"{col}: {row[col]}" for col in df.columns)
                doc = Document(page_content=text, metadata=metadata)
                all_docs.append(doc)
                
        elif ext in {".xlsx", ".xls"}:
            df = pd.read_excel(BytesIO(file_content), engine="openpyxl")
            df = clean_dataframe(df)
            for _, row in df.iterrows():
                text = ", ".join(f"{col}: {row[col]}" for col in df.columns)
                doc = Document(page_content=text, metadata=metadata)
                all_docs.append(doc)
                
        elif ext == ".pdf":
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            tmp.write(file_content)
            tmp.flush()
            docs = PyMuPDFLoader(tmp.name).load()
            for doc in docs:
                doc.metadata.update(metadata)
                all_docs.append(doc)
            os.unlink(tmp.name)  # Clean up temp file

        elif ext == ".pptx":
            docs = process_pptx_file(file_content, upload.filename)
            all_docs.extend(docs)

        elif ext == ".docx":
            docs = process_docx_file(file_content, upload.filename)
            all_docs.extend(docs)
                
        elif ext in {".png", ".jpg", ".jpeg", ".gif"}:
            # TODO: implement image embedding with CLIP
            continue
    
    if not all_docs:
        raise HTTPException(400, "No processable files found")
    
    # Create embeddings and vectorstore
    embeddings = HuggingFaceEmbeddings(
        model_name=embedding_model, 
        model_kwargs={'trust_remote_code': True}
    )
    
    # Create text splitter
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
    split_docs = text_splitter.split_documents(all_docs)
    
    # Create vectorstore for this collection
    vectorstore = Chroma.from_documents(
        documents=split_docs,
        embedding=embeddings,
        persist_directory=collection_dir,
    )
    
    # Store collection info in session
    SESSIONS[session_id]["collections"][collection_id] = {
        "vectorstore": vectorstore,
        "name": collection_name,
        "files": file_info_list,
        "created_at": time.time(),
        "embedding_model": embedding_model
    }
    
    # Set as active collection
    SESSIONS[session_id]["active_collection_id"] = collection_id
    
    # Automatically create a chatbot for this collection
    try:
        # Create LLM
        llm = ChatOllama(model="llama3.1", temperature=0)
        
        # Create prompt template
        qa_prompt = PromptTemplate(
            input_variables=["context", "question"],
            template="You are a helpful AI. Use the following context to answer the question:\n\nContext: {context}\n\nQuestion: {question}\n\nAnswer:"
        )
        
        # Create retriever
        retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 2})
        
        # Create chain
        chain = ConversationalRetrievalChain.from_llm(
            llm=llm, 
            retriever=retriever, 
            return_source_documents=True,
            combine_docs_chain_kwargs={"prompt": qa_prompt},
            verbose=True
        )
        
        # Store chain in session
        SESSIONS[session_id]["chain"] = chain
        print(f"DEBUG: Chatbot automatically created for collection {collection_id} in session {session_id}")
        
    except Exception as e:
        print(f"ERROR: Failed to create chatbot automatically: {str(e)}")
        # Don't fail the ingestion if chatbot creation fails
    
    return JSONResponse({
        "session_id": session_id,
        "collection_id": collection_id,
        "collection_name": collection_name,
        "files_processed": len(files),
        "chatbot_created": "chain" in SESSIONS[session_id] and SESSIONS[session_id]["chain"] is not None
    })