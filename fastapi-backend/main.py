# main.py
import json
import os
import uuid
import shutil
from typing import Dict, List, Optional
import logging
import re

import pandas as pd
import numpy as np

from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from utils import create_table_summary_prompt, segment_and_export_tables, clean_dataframe

from pydantic import BaseModel
import base64
from io import BytesIO

import uvicorn
import ollama
import tempfile

from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain.chains import ConversationalRetrievalChain
from langchain_ollama import ChatOllama
from langchain.prompts import PromptTemplate


logging.basicConfig(level=logging.INFO)
###############################################################################
# Global configuration & in-memory store
###############################################################################

app = FastAPI()

# Allow CORS from localhost:5173 (the default Vite port) or adjust to your front-end domain
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploaded_files"
OUTPUT_DIR = "output_tables"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# { session_id -> [ (csv_file, name), ... ] }
SESSION_TABLES = {}
SESSIONS = {}

class ChatHistory(BaseModel):
    history: List = []

###############################################################################
# API Routes
###############################################################################
@app.post("/api/upload_file")
async def upload_file(file: UploadFile = File(...), file_type: str = Form(...)):
    """
    Upload a file and return a session id.
    """
    print(f"Upload request received: {file.filename}")
    print(f"File content type: {file.content_type}")
    try:
        session_id = uuid.uuid4().hex
        logging.info(f"Starting upload for session: {session_id}")
        
        if file_type == "excel":
            file_ext = file.filename.split(".")[-1]
            

            unique_name = f"{session_id}.{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, unique_name)
        
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            logging.info("File saved, processing tables...")
            table_info = segment_and_export_tables(file_path, session_id)
            
            # Store the table info in the SESSION_TABLES dictionary in main.py
            SESSION_TABLES[session_id] = table_info
            
            response_data = {
                "session_id": session_id,
                "tables": [{"csv_filename": csv_name, "display_name": file.filename} for _, csv_name in table_info],
            }
        elif file.content_type == "application/pdf":
            file_ext = "pdf"
            file_name = file.filename
            unique_name = f"{session_id}_{file_name}.{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, unique_name)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            response_data = {
                "session_id": session_id,
                "file_name": file_name
            }
        elif file.content_type == "image/jpeg" or file.content_type == "image/png":
            file_ext = "jpg"
            file_name = file.filename
            unique_name = f"{session_id}_{file_name}.{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, unique_name)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            response_data = {
                "session_id": session_id,
                "file_name": file_name
            }
        else:
            return JSONResponse(content={"error": "Invalid file type"}, status_code=400)
        logging.info("Upload complete")
        return JSONResponse(content=response_data)

    except Exception as e:
        logging.error(f"Error during upload: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/api/list_tables/{session_id}")
def list_tables(session_id: str):
    """
    Return the tables found for a given session, if any.
    """
    table_info = SESSION_TABLES.get(session_id, [])
    data = [
        {
            "csv_filename": csv_name,
            "display_name": csv_name
        }
        for (path, csv_name) in table_info
    ]
    return JSONResponse(content={"tables": data})

@app.get("/api/preview_table")
def preview_table(session_id: str, csv_filename: str):
    """
    Return a small preview of the CSV (first 5 rows, for example).
    """
    logging.info(f"Preview request received for session: {session_id}, file: {csv_filename}")
    
    # locate the path
    table_info = SESSION_TABLES.get(session_id, [])
    logging.info(f"Session tables: {table_info}")
    
    match = [p for (p, n) in table_info if n == csv_filename]
    if not match:
        logging.warning(f"Table not found: {csv_filename} for session: {session_id}")
        return JSONResponse(content={"error": "Table not found"}, status_code=404)
    
    csv_path = match[0]
    logging.info(f"Loading CSV from path: {csv_path}")
    
    try:
        df = pd.read_csv(csv_path)
        df = clean_dataframe(df)
        preview = df.to_dict(orient="records")
        columns = df.columns.tolist()
        logging.info(f"Preview generated for file: {csv_filename}")
        return JSONResponse(content={"columns": columns, "preview": preview})
    except Exception as e:
        logging.error(f"Error loading CSV for preview: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/api/export_subset")
def export_subset(
    session_id: str = Form(...),
    csv_filename: str = Form(...),
    columns: str = Form(...)
):
    """
    Return a CSV file of the selected columns from the given table.
    """
    table_info = SESSION_TABLES.get(session_id, [])
    match = [p for (p, n) in table_info if n == csv_filename]
    if not match:
        return JSONResponse(content={"error": "Table not found"}, status_code=404)
    csv_path = match[0]

    df = pd.read_csv(csv_path)
    selected_cols = columns.split(",") if columns else []
    for col in selected_cols:
        if col not in df.columns:
            return JSONResponse(content={"error": f"Column {col} not in table"}, status_code=400)
    sub_df = df[selected_cols]
    # We can create a temporary file
    tmp_name = f"{uuid.uuid4().hex}_{csv_filename}"
    tmp_path = os.path.join(OUTPUT_DIR, tmp_name)
    sub_df.to_csv(tmp_path, index=False)
    return FileResponse(tmp_path, media_type="text/csv", filename=tmp_name)
    
###############################################################################
# AI and Vector Routes
###############################################################################

# Vector Generator
@app.post("/api/create_vectorstore")
async def generate_vectors(
    embedding_model: str = Body(...),
    documents: str = Body(...)  # JSON string of documents
):
    """
    Create a vector store from a list of documents and a specified embedding model.
    """
    print("!!!! DOCS " , documents)
    # Parse the JSON string back to documents
    docs_data = json.loads(documents)
    docs = [Document(page_content=doc["page_content"], metadata=doc["metadata"]) for doc in docs_data]
    
    # Create embeddings
    embeddings = HuggingFaceEmbeddings(model_name=embedding_model, model_kwargs={'trust_remote_code': True})
    
    # Create text splitter
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
    split_docs = text_splitter.split_documents(docs)
    
    # Create vector store
    session_id = uuid.uuid4().hex
    save_directory = f"download_files/chroma_db/{session_id}"
    os.makedirs(save_directory, exist_ok=True)
    
    vectorstore = Chroma.from_documents(
        documents=split_docs, 
        embedding=embeddings,
        persist_directory=save_directory
    )
    
    # Store in session
    SESSIONS[session_id] = {"vectorstore": vectorstore, "history": []}
    
    return JSONResponse(content={"session_id": session_id})

# Create Documents from Images 
@app.post("/api/create_documents_from_images")
async def create_documents_from_images(
    image_jsons: str = Form(...)  # JSON string of image data
):
    """
    Create documents from a list of image jsons.
    """
    image_data = json.loads(image_jsons)
    data = []
    
    for i, (image_name, image_json) in enumerate(image_data.items()):
        data.append({
            "page_content": image_json["Summary"], 
            "metadata": {"source": image_name}, 
            "id": i
        })
    
    return JSONResponse(content={"documents": data})

# Generate Chatbot 
@app.post("/api/create_chatbot/{session_id}")
async def create_chatbot(
    session_id: str,
    model_name: str = Form(...),
    chat_prompt: str = Form(...),
):
    """
    Create a chatbot with a specified model, chat prompt, and embedding model.
    """
    # if session_id not in SESSIONS:
    #     raise HTTPException(status_code=404, detail="Session not found")
    
    # vectorstore = SESSIONS[session_id]["vectorstore"]
    if session_id not in SESSIONS:
        SESSIONS[session_id] = {"vectorstore": None, "chain": None}  # Initialize session

    vectorstore = SESSIONS[session_id].get("vectorstore")

    if vectorstore is None:
        raise HTTPException(status_code=400, detail="Vectorstore not initialized for this session")


    
    # Create LLM
    llm = ChatOllama(model=model_name, temperature=0)
    
    # Create prompt template
    qa_prompt = PromptTemplate.from_template(template=chat_prompt)
    
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
    
    return JSONResponse(content={"status": "success"})

# Get Chat Response 
@app.post("/api/get_chat_response/{session_id}")
async def get_chat_response(
    session_id: str,
    query: str = Form(...)
):
    """
    Get a chat response from a chatbot with a specified query and chain.
    """
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if "chain" not in SESSIONS[session_id]:
        raise HTTPException(status_code=400, detail="Chatbot not created yet")
    
    chain = SESSIONS[session_id]["chain"]
    history = SESSIONS[session_id].get("history", [])
    
    result = chain({"question": query, "chat_history": history})
    SESSIONS[session_id]["history"] = history + [(query, result["answer"])]
    
    return JSONResponse(content={"answer": result["answer"]})

# Image Analyzer
@app.post("/api/analyze_image")
async def analyze_image(
    model: str = Form("llava"),
    session_id: str = Form(...),
    file_name: str = Form(...),
):
    """
    Analyze an image and return a json object with a summary.
    """
    print(f"Image analysis request received: filename={file_name}, session_id={session_id}")
    # get the image from the session
    image_path = os.path.join(UPLOAD_DIR, f"{session_id}_{file_name}.jpg")
    with open(image_path, "rb") as image_file:
        contents = image_file.read()

    prompt = "Describe the image and extract key words relevant to space experiments. Output in a JSON with the following format: {\"Summary\":\"This is your description of the image\", \"Keywords\":[\"keyword_1\", \"keyword_2\"]}"
    res = ollama.chat(
        model=model,
        messages=[
            {
                "role": "user",
                "content": prompt,
                "images": [contents]
            }
        ]
    )
    # Parse the JSON response
    json_output = {}
    res_text = res['message']['content']
    # First try to parse directly
    try:
        clean_text = res_text.replace("```json", "").replace("```", "").strip()
        json_output = json.loads(clean_text)
    except json.decoder.JSONDecodeError:
        # If that fails, try regex extraction
        json_match = re.search(r'(?i)\{[\s\S]*"summary"[\s\S]*"keywords"[\s\S]*\}', res_text)
        if json_match:
            json_text = json_match.group(0)
            try:
                json_output = json.loads(json_text)
            except json.decoder.JSONDecodeError:
                json_output['Error'] = res_text
        else:
            json_output['Error'] = res_text

    # Normalize the keys
    normalized_output = {
        "summary": json_output.get("Summary") or json_output.get("summary", ""),
        "keywords": json_output.get("Keywords") or json_output.get("keywords", []),
    }

    if "Error" in json_output or "error" in json_output:
        normalized_output["error"] = json_output.get("Error") or json_output.get("error")

    return JSONResponse(content=normalized_output)


# PDF Analyzer
@app.post("/api/analyze_pdf")
def analyze_pdf(pdf_file: UploadFile = File(...),):
    """
    Analyze a PDF and return a json object with a summary.
    """
    # We'll use PyMuPDF to load the PDF
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
        tmp_file.write(pdf_file.getvalue())
        tmp_file_path = tmp_file.name

    loader = PyMuPDFLoader(file_path=tmp_file_path)
    data = loader.load()
    
    return JSONResponse(content={
        "documents": [{"page_content": doc.page_content, "metadata": doc.metadata} for doc in data]
    })

@app.post("/api/analyze_table")
def analyze_table(
    session_id: str = Form(...),
    csv_name: str = Form(...),
    model: str = Form("llama3.1"),
):
    """
    Analyze a table and provide a summary and keywords.
    """
    # Get the table from the session
    table_info = SESSION_TABLES.get(session_id, [])
    match = [p for (p, n) in table_info if n == csv_name]
    if not match:
        return JSONResponse(
            content={"error": f"Table '{csv_name}' not found in session"}, 
            status_code=404
        )
    csv_path = match[0]
    try:
        # Load the table with pandas 
        df = pd.read_csv(csv_path)
        table_df = clean_dataframe(df)
        prompt = create_table_summary_prompt(table_df)
        # Call Ollama API
        res = ollama.chat(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ]
        )
        # Parse the JSON response
        json_output = {}
        res_text = res['message']['content']
        # look for JSON objects within the text
        json_match = re.search(r'\{[\s\S]*"summary"[\s\S]*"keywords"[\s\S]*\}', res_text)
        if json_match:
            json_text = json_match.group(0)
            try:
                json_output = json.loads(json_text)
            except json.decoder.JSONDecodeError:
                json_output['Error'] = res_text
        else:
            # If no JSON object found, try to clean the text and parse
            res_text = res_text.replace("```json", "").replace("```", "")
            try:
                json_output = json.loads(res_text)
            except json.decoder.JSONDecodeError:
                json_output['Error'] = res_text
            
        return JSONResponse(content=json_output)
    except Exception as e:
        logging.error(f"Error analyzing table: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
