# main.py
import asyncio
import json
import os
import time
import uuid
import shutil
from typing import Dict, List, Optional, Literal
import logging
import re
import datetime


import pandas as pd
import numpy as np

from fastapi import FastAPI, File, Request, UploadFile, Form, Depends, HTTPException, Body, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from contextlib import asynccontextmanager
api_router = APIRouter()


from utils import create_table_summary_prompt, segment_and_export_tables, clean_dataframe, get_magic_wand_suggestions

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
from langchain.chains import ConversationalRetrievalChain, LLMChain
from langchain_ollama import ChatOllama
from langchain.prompts import PromptTemplate

import asyncio, yaml
from mcp_agent.app import MCPApp
from mcp_agent.config import Settings
from mcp_agent.agents.agent import Agent
from mcp_agent.workflows.llm.augmented_llm_openai import OpenAIAugmentedLLM
from mcp_agent.logging.logger import get_logger

from config.rag_templates import TEMPLATES

import torch
if hasattr(torch, "mps") and torch.backends.mps.is_available():
    torch.mps.empty_cache()
    print("MPS cache cleared.")
else:
    print("MPS not available, skipping cache clear.")
from pathlib import Path

# for debuging
import logging

# Source code overide for MCP agent with fastapi 
from mcp_agent.mcp import mcp_agent_client_session as _mcp_sess

_orig_send = _mcp_sess.MCPAgentClientSession.send_request
async def _fixed(self, request, *args, **kwargs):
    kwargs.pop("request_read_timeout_seconds", None)  # strips unsupported kwarg
    return await _orig_send(self, request, *args, **kwargs)

_mcp_sess.MCPAgentClientSession.send_request = _fixed

logging.basicConfig(level=logging.DEBUG)
logging.basicConfig(level=logging.INFO)

###############################################################################
# Global configuration & in-memory store
###############################################################################

async def cleanup_job():
    while True:
        torch.mps.empty_cache()
        await asyncio.sleep(3600 * 24)  # Run every 24 hours 
        now = time.time()
        for session_id, last_active in list(ACTIVE_SESSIONS.items()):
            if now - last_active > SESSION_TIMEOUT:
                shutil.rmtree(f"{USER_DIRS}/{session_id}", ignore_errors=True)
                del ACTIVE_SESSIONS[session_id]

CONFIG_PATH = Path(__file__).parent / "mcp_modules" / "config.yaml"

def load_config() -> Settings:
    with CONFIG_PATH.open() as f:
        return Settings(**yaml.safe_load(f))

@asynccontextmanager
# async def lifespan(app: FastAPI):
#     asyncio.create_task(cleanup_job())
#     yield
async def lifespan(app: FastAPI):
    """
    - Start MCP servers once.
    - Tear them down when the FastAPI process exits.
    """
    settings = load_config()
    print("Loaded servers from YAML:", settings.mcp.servers.keys())

    app.state.mcp_app = MCPApp(settings=settings)
    import openai
    openai.api_key  = settings.openai.api_key
    openai.base_url = settings.openai.base_url
    asyncio.create_task(cleanup_job()) # Clean up job for cookie tokens
    async with app.state.mcp_app.run():
        yield 

app = FastAPI(lifespan=lifespan)

# Allow CORS from localhost:5173 (the default Vite port) or adjust to your front-end domain
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Add to config
SESSION_TIMEOUT = 86400  # 24 hours in seconds
USER_DIRS = "user_uploads"
JSON_DIRS = "cached_jsons"

# Session tracking dict
ACTIVE_SESSIONS = {}  # {session_id: last_activity_timestamp}

# UPLOAD_DIR = "uploaded_files"
OUTPUT_DIR = "output_tables"
# os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# { session_id -> [ (csv_file, name), ... ] }
SESSION_TABLES = {}
SESSIONS = {}
VECTOR_STORES = {}

# MCP server var init
mcp_server = None

class ChatHistory(BaseModel):
    history: List = []

# Middleware
@app.middleware("http")
async def session_manager(request: Request, call_next):
    session_id = request.cookies.get("user_session")
    if session_id and not re.match(r"^[a-f0-9]{32}$", session_id):
        # Invalid format, generate new
        session_id = None
    if session_id and not os.path.exists(f"{USER_DIRS}/{session_id}"):
        # Directory missing, treat as new session
        session_id = None
     # New user
    if not session_id or session_id not in ACTIVE_SESSIONS:
        session_id = uuid.uuid4().hex
        os.makedirs(f"{USER_DIRS}/{session_id}", exist_ok=True)
    request.state.session_id = session_id
    ACTIVE_SESSIONS[session_id] = time.time()
    
    response = await call_next(request)

    # Restore the response for FastAPI
    from starlette.responses import Response
    new_response = Response(
        content=b"".join([chunk async for chunk in response.body_iterator]),
        status_code=response.status_code,
        headers=dict(response.headers),
        media_type=response.media_type,
    )
    
    new_response.set_cookie(
        "user_session",
        session_id,
        max_age=SESSION_TIMEOUT,
        httponly=True,
        secure=True,
        samesite="Lax"
    )

    return new_response



###############################################################################
# API Routes
###############################################################################
@app.get("/api/get_file/{filename}")
async def get_file(filename: str, request: Request):
    session_id = request.state.session_id
    file_path = os.path.join(USER_DIRS, session_id, filename)
    print(file_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)

@app.get("/api/get_session_files")
async def get_files(request: Request):
    session_id = request.state.session_id
    UPLOAD_DIR = os.path.join(USER_DIRS, session_id)
    
    if not os.path.exists(UPLOAD_DIR):
        return JSONResponse(content={"files": []})
    
    try:
        files = []
        for filename in os.listdir(UPLOAD_DIR):
            file_path = os.path.join(UPLOAD_DIR, filename)
            file_ext = filename.split(".")[-1]
            if os.path.isfile(file_path):
                files.append({
                    "name": filename,
                    "type": file_ext,
                    "dateCreated": datetime.datetime.fromtimestamp(os.path.getctime(file_path)).strftime('%-m/%-d/%Y'),
                    "size": os.path.getsize(file_path),
                })

            if file_ext == "excel" or file_ext == "xlsx":
                table_info = segment_and_export_tables(file_path, session_id)
                
                # Store the table info in the SESSION_TABLES dictionary in main.py
                SESSION_TABLES[session_id] = table_info
                
                # response_data = {
                #     "tables": [{"csv_filename": csv_name, "display_name": filename} for _, csv_name in table_info],
                # }
        
        return JSONResponse(content={"files": files})

    except Exception as e:
        logging.error(f"Error during retrieval: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
    
@app.post("/api/upload_file")
async def upload_file(request: Request, file: UploadFile = File(...), file_type: str = Form(...)):
    """
    Upload a file and return a session id. Unless sessionid is present.
    """
  
    session_id = request.state.session_id
    UPLOAD_DIR = os.path.join(USER_DIRS, session_id)
    
    try:
        # if session_id is not None or session_id == "":
        #     session_id = uuid.uuid4().hex
        logging.info(f"Starting upload for session: {session_id}")

        if file_type == "excel" or file_type == "xlsx":
            file_ext = file.filename.split(".")[-1]
            

            unique_name = f"{file.filename}"
            file_path = os.path.join(UPLOAD_DIR, unique_name)
        
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            logging.info("File saved, processing tables...")
            table_info = segment_and_export_tables(file_path, session_id)
            
            # Store the table info in the SESSION_TABLES dictionary in main.py
            SESSION_TABLES[session_id] = table_info
            
            response_data = {
                "tables": [{"csv_filename": csv_name, "display_name": file.filename} for _, csv_name in table_info],
            }
        elif file.content_type == "application/pdf":
            file_ext = "pdf"
            file_name = file.filename
            unique_name = f"{file_name}"
            file_path = os.path.join(UPLOAD_DIR, unique_name)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            response_data = {
                "file_name": file_name
            }
        elif file.content_type == "image/jpeg" or file.content_type == "image/png":
            file_ext = file.filename.split(".")[-1]
            file_name = file.filename
            unique_name = f"{file_name}"
            file_path = os.path.join(UPLOAD_DIR, unique_name)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            response_data = {
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
def preview_table(request: Request, csv_filename: str):
    """
    Return a small preview of the CSV (first 5 rows, for example).
    """
    session_id = request.state.session_id
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

# MCP Route
@app.post("/api/mcp_query")
async def mcp_query(
    query: str = Body(..., embed=True),
): 
    try:
        logger = get_logger(__name__)
        # Create Agent
        osdr_agent = Agent(
            name="osdr_bot",
            instruction=(
                """
                    You are an AI agent that helps users understand NASA space biology datasets in the OSDR repository.

                    Your job is to:
                    1. Detect if the user referenced an OSD study (e.g., “study 488”, “osd488”, “OSD-488”).
                    2. Normalize it to the correct dataset ID format: `OSD-###`.
                    3. Use the tool `osdr_fetch_metadata` to retrieve metadata from:
                    https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/{dataset_id}/
                """
            ),
            server_names=["OSDRServer"],
        )

        async with osdr_agent:

            # Automatically initialize the MCP servers and adds their tools for LLM use
            tools = await osdr_agent.list_tools()
            logger.info(f"Tools available:", data=tools)

            # Attach an LLM and send the question
            llm = await osdr_agent.attach_llm(OpenAIAugmentedLLM)

            # Step 1: Call the tool directly
            resp = await llm.generate_str(message=query)
            logger.info(f"Result: {resp}")
          
            return {"response": resp}   

                 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Vector Generator
@app.post("/api/create_vectorstore")
async def generate_vectors(
    request: Request, # CHANGED!
    embedding_model: str = Body(...),
    documents: str = Body(...)  # JSON string of documents
):
    """
    Create a vector store from a list of documents and a specified embedding model.
    """
    # ⇨ use the cookie‐managed session_id - CHANGED!
    session_id = request.state.session_id

    print("CREATE VECTORSTORE, cookie: ", session_id)
    # Parse the JSON string back to documents
    docs_data = json.loads(documents)
    docs = [Document(page_content=doc["page_content"], metadata=doc["metadata"]) for doc in docs_data]
    
    # Create embeddings
    embeddings = HuggingFaceEmbeddings(model_name=embedding_model, model_kwargs={'trust_remote_code': True})
    
    # Create text splitter
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)
    split_docs = text_splitter.split_documents(docs)
    

    # persist under a folder for this session - CHANGED!
    # instead of vectorstore, it was chroma_db, but that path is not used anywhere
    # it doesn't work, when changed to vectorstore
    save_directory = os.path.join(USER_DIRS, session_id, "chroma_db")
    os.makedirs(save_directory, exist_ok=True)
    
    # returns VectorStore initialized from documents and embeddings.
    vectorstore = Chroma.from_documents(
        documents=split_docs, 
        embedding=embeddings,
        persist_directory=save_directory
    )
    
    # Check if cookie exists in SESSIONS, if not create one
    user_session = SESSIONS.setdefault(
        session_id,
        {"vectorstore": None, "history": []}
    )

    user_session["vectorstore"] = vectorstore
    vectorstore.persist() # maybe redundent
    
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
    model_name: str = Body(...),
    chat_prompt: str = Body(...), #it looks like its unused but it is
):
    """
    Create a chatbot with a specified model, chat prompt, and embedding model.
    """
    if session_id not in SESSIONS:
        SESSIONS[session_id] = {"vectorstore": None, "chain": None}  # Initialize session

    vectorstore = SESSIONS[session_id].get("vectorstore")

    if vectorstore is None:
        raise HTTPException(status_code=400, detail="Vectorstore not initialized for this session")
    
    # Create LLM
    llm = ChatOllama(model="llama3.1", temperature=0)
    
    # Create prompt template
    qa_prompt = PromptTemplate(
    input_variables=["context", "question"],  # Ensure "context" is included
    template="You are a helpful AI. Use the following context to answer the question:\n\nContext: {context}\n\nQuestion: {question}\n\nAnswer:")

    llm_chain = LLMChain(llm=llm, prompt=qa_prompt)

    # Create retriever
    retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 2})
    
    # Create chain
    chain = ConversationalRetrievalChain.from_llm(
    llm=llm, 
    retriever=retriever, 
    return_source_documents=True,
    combine_docs_chain_kwargs={"prompt": qa_prompt},
    verbose=True)

    
    # Store chain in session
    SESSIONS[session_id]["chain"] = chain
    
    return JSONResponse(content={"status": "success"})

# Get Chat Response 
@app.post("/api/get_chat_response/{session_id}")
async def get_chat_response(
    session_id: str,
    query: str = Body(..., embed=True)
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
    request: Request,
    model: str = Form("llava"),
    file_name: str = Form(...),
):
    """
    Analyze an image and return a json object with a summary.
    """
    session_id = request.state.session_id
    UPLOAD_DIR = os.path.join(USER_DIRS, session_id)
    CACHED_DIR = os.path.join(JSON_DIRS, session_id)
    os.makedirs(CACHED_DIR, exist_ok=True)
    json_path = os.path.join(CACHED_DIR, f"{file_name}.json")
    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            loaded_output = json.load(f)

        return JSONResponse(content=loaded_output)
    
    print(f"Image analysis request received: filename={file_name}, session_id={session_id}")

    # get the image from the session
    image_path = os.path.join(UPLOAD_DIR, f"{file_name}")
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
    else:
        # Save normalized output to cached json file
        try: 
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(normalized_output, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving file: {str(e)}")

    return JSONResponse(content=normalized_output)


# PDF Analyzer
@app.post("/api/analyze_pdf")
async def analyze_pdf(
    request: Request,
    pdf_file_name: str = Form(...),
    model: str = Form("llava"),
    ):
    """
    Analyze a PDF and return a json object with a summary.
    """
    # logged received file
    print(f"received: {pdf_file_name}")
    session_id = request.state.session_id
    UPLOAD_DIR = os.path.join(USER_DIRS, session_id)
    CACHED_DIR = os.path.join(JSON_DIRS, session_id)
    os.makedirs(CACHED_DIR, exist_ok=True)
    json_path = os.path.join(CACHED_DIR, f"{pdf_file_name}.json")
    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            loaded_output = json.load(f)
        
        return JSONResponse(content=loaded_output)
    
    # Get pdf file
    pdf_path = os.path.join(UPLOAD_DIR, f"{pdf_file_name}")
    with open(pdf_path, "rb") as pdf_file:        
        # We'll use PyMuPDF to load the PDF
        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)

        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            tmp_file.write(pdf_file.read())
            tmp_file_path = tmp_file.name

        loader = PyMuPDFLoader(file_path=tmp_file_path)
        data = loader.load()
    
    # Only analyzes first page now, enable list comprehension for all pages and aggregate the content when a better model is used.
    print(data[0].page_content)
    # Call model to get summary in json format
    prompt = "Summarize the text given. Output in a JSON with the following format: {\"Summary\":\"This is your description of the pdf\", \"Keywords\":[\"keyword_1\", \"keyword_2\"]}" + f"Here is the text: {data[0].page_content}"
    res = ollama.chat(
        model=model,
        messages=[
            {
                "role":"user",
                "content": prompt,
            }
        ]
    )
    json_output = {}
    res_text = res['message']['content']
    print(res_text)

    try: 
        clean_text = res_text.replace("```json", "").replace("```", "").strip()
        json_output = json.loads(clean_text)
    except json.decoder.JSONDecodeError:
        return "json:error"
    
    # Normalize the keys
    normalized_output = {
        "summary": json_output.get("Summary") or json_output.get("summary", ""),
        "keywords": json_output.get("Keywords") or json_output.get("keywords", []),
    }

    normalized_output.update(get_magic_wand_suggestions(data[0].page_content, model))

    if "Error" in json_output or "error" in json_output:
        normalized_output["error"] = json_output.get("Error") or json_output.get("error")
    else:
        try:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(normalized_output, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving file: {str(e)}")

    return JSONResponse(content=normalized_output)
    # return JSONResponse(content={
    #     "documents": [{"page_content": doc.page_content, "metadata": doc.metadata} for doc in data]
    # })

@app.post("/api/analyze_table")
def analyze_table(
    request: Request,
    csv_name: str = Form(...),
    model: str = Form("llama3.1"),
):
    """
    Analyze a table and provide a summary and keywords.
    """
    # Get the table from the session
    session_id = request.state.session_id
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
        
        json_output.update(get_magic_wand_suggestions(table_df.to_string(), model))
        return JSONResponse(content=json_output)
    except Exception as e:
        logging.error(f"Error analyzing table: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


# Ingest raw list of files into vector store
@app.post("/api/ingest")
async def ingest(
    request: Request,
    files: List[UploadFile] = File(...),
    embedding_model: str    = Form("sentence-transformers/all-MiniLM-L6-v2"),
):
    """
    Ingest any mix of CSV, PDF, and image files into a new vectorstore batch.
    Returns a vectorstore_id for this batch.
    """
    session_id = request.state.session_id

    save_dir = os.path.join(USER_DIRS, session_id, "chroma_db")
    os.makedirs(save_dir, exist_ok=True)

    vectorstore  = SESSIONS[session_id]["vectorstore"]

    df = None
    for upload in files:
        ext = Path(upload.filename).suffix.lower()
        metadata = {"source": upload.filename, "filetype": ext}

        print("What is the current file's ext, ", ext)
        # 1) Handle CSV files
        if ext == ".csv":
            df = pd.read_csv(BytesIO(await upload.read()))
        elif ext in {".xlsx", ".xls"}:
            # Handle Excel files
            df = pd.read_excel(BytesIO(await upload.read()), engine="openpyxl")

        # 2) PDF → PyMuPDFLoader
        elif ext == ".pdf":
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            tmp.write(await upload.read()); tmp.flush()
            docs = PyMuPDFLoader(tmp.name).load()
            for doc in docs:
                doc.metadata.update(metadata)
            vectorstore.add_documents(docs)

        # 3) Images → (example) CLIP or other image embedder
        elif ext in {".png", ".jpg", ".jpeg", ".gif"}:
                # TODO: implement image embedding, can use HugginFace's CLIP model
            continue
            data = await upload.read()
            # imagine we have `image_to_embedding` util
            emb, text = image_to_embedding(data)  
            # add one “Document” wrapping both embedding + caption text
            vectorstore.add_texts([text], embeddings=[emb], metadatas=[metadata])

        else:
            # skip unknown types
            continue

    # Now you have a DataFrame for both CSV and Excel, add embeddings to vectorstore
    if df is not None:
        df = clean_dataframe(df)
        for _, row in df.iterrows():
            text = ", ".join(f"{col}: {row[col]}" for col in df.columns)
            print("TEXT We are about to store in Chroma:", text)
            vectorstore.add_texts([text], metadatas=[metadata])

    return JSONResponse({"session_id": session_id}) 


# Magic Wand / Sparkles Description tables route
# For main.py refactore, this to be moved to it's own folder/file, services/rag_services.py
def _generic_rag_summarizer(
    request: Request,
    file_names:        List[str],
    model:             str,
    top_k:             int,
    instructions:      Dict[str,str],
    extra_instructions: Optional[str] = None
) -> JSONResponse:
    
    session_id = request.state.session_id
    vectorstore  = SESSIONS[session_id]["vectorstore"]

    print("!! generate_rag_with_template - session_id:", session_id, "has vectorstore?", bool(vectorstore))

    # 1) Collect top_k chunks for each CSV
    all_chunks = []
    for name in file_names:
        docs = vectorstore.similarity_search(
            query=f"Fetch context for '{name}'",
            k=top_k,
            filter={"source": name}
        )
        if docs:
            all_chunks.extend(docs)

    if not all_chunks:
        raise HTTPException(404, "No data chunks found for any requested files")

    context = "\n\n".join(d.page_content for d in all_chunks)

    # 2) Build your dynamic schema block
    schema_lines = [f'  "{k}": "{v}"' for k, v in instructions.items()]
    schema_block = "{\n" + ",\n".join(schema_lines) + "\n}"

    # 3) Prepend any extra instructions
    prompt = "You are a scientific assistant.\n"
    if extra_instructions:
        prompt += extra_instructions.strip() + "\n\n"
    prompt += f"""Based only on the data snippets below, produce valid JSON with:

    Output format:
    {schema_block}

    Data snippets:
    {context}
    """

    # 4) Call the LLM
    res_text = ollama.chat(
        model=model,
        messages=[{"role":"user","content": prompt}]
    )["message"]["content"]

    # 5) Extract the JSON blob
    import re, json
    m = re.search(r'\{[\s\S]*\}', res_text)
    if not m:
        return JSONResponse({"error": "No JSON found", "raw": res_text}, status_code=500)
    try:
        payload = json.loads(m.group(0))
    except json.JSONDecodeError:
        return JSONResponse({"error": "Invalid JSON", "raw": res_text}, status_code=500)

    return JSONResponse(payload)

class BranchRequest(BaseModel):
    file_names:         List[str]
    template:           Literal["biophysics","geology"]
    model:              str = "llama3.1"
    top_k:              int = 5
    extra_instructions: Optional[str] = None

@app.post("/api/generate_rag_with_template")
def generate_rag_with_template(
    request: Request,
    payload: BranchRequest = Body(...),
):
    print("payload_ _ _ :", payload)
    # pick the right instruction set
    instructions = TEMPLATES[payload.template]
    # hand off to the generic summarizer
    return _generic_rag_summarizer(
        request,
        file_names         = payload.file_names,
        model              = payload.model,
        top_k              = payload.top_k,
        instructions       = instructions,
        extra_instructions = payload.extra_instructions
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, lifespan=lifespan, workers=4)
