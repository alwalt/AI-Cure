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

# Import from their original locations
from utils import clean_dataframe
from file_handlers.file_tools import USER_DIRS
from config.shared import SESSIONS, initialize_session, chroma_settings, hnsw_metadata


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
        
        # Handle different file types
        if ext == ".csv":
            df = pd.read_csv(BytesIO(await upload.read()))
            df = clean_dataframe(df)
            for _, row in df.iterrows():
                text = ", ".join(f"{col}: {row[col]}" for col in df.columns)
                doc = Document(page_content=text, metadata=metadata)
                all_docs.append(doc)
                
        elif ext in {".xlsx", ".xls"}:
            df = pd.read_excel(BytesIO(await upload.read()), engine="openpyxl")
            df = clean_dataframe(df)
            for _, row in df.iterrows():
                text = ", ".join(f"{col}: {row[col]}" for col in df.columns)
                doc = Document(page_content=text, metadata=metadata)
                all_docs.append(doc)
                
        elif ext == ".pdf":
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            tmp.write(await upload.read())
            tmp.flush()
            docs = PyMuPDFLoader(tmp.name).load()
            for doc in docs:
                doc.metadata.update(metadata)
                all_docs.append(doc)
            os.unlink(tmp.name)  # Clean up temp file
            
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
        client_settings=chroma_settings,
        collection_metadata=hnsw_metadata,
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