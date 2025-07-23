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
from fastapi.responses import FileResponse, JSONResponse, Response
from contextlib import asynccontextmanager
api_router = APIRouter()


from utils import create_table_summary_prompt, segment_and_export_tables, clean_dataframe, get_magic_wand_suggestions

from pydantic import BaseModel
import base64
from io import BytesIO

import uvicorn
import ollama
import tempfile
import zipfile
from io import BytesIO

# from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain.chains import ConversationalRetrievalChain, LLMChain
from langchain_ollama import ChatOllama
from langchain.prompts import PromptTemplate
from chromadb.config import Settings as ChromaSettings # hyperparams
from langchain_community.vectorstores import Chroma # hyperparams

import asyncio, yaml
from mcp_agent.app import MCPApp
from mcp_agent.config import Settings
from mcp_agent.agents.agent import Agent
from mcp_agent.workflows.llm.augmented_llm_openai import OpenAIAugmentedLLM
from mcp_agent.logging.logger import get_logger

from chat_memory import get_session_history, add_chat_message

from rag_calls.rag_templates import TEMPLATES
from rag_calls.api_rag_calls import router as rag_router

from file_handlers.file_tools import USER_DIRS, JSON_DIRS, SESSION_TABLES, router as file_router
from pdf_handlers.pdf_tools import router as pdf_router
from image_handlers.image_tools import router as image_router
from table_handlers.table_tools import router as table_router

from ingest.ingest_route import ingest_collection
from config.shared import SESSIONS, initialize_session, chroma_settings, hnsw_metadata

from pydantic import ValidationError

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
app.include_router(rag_router) # Include single rag calls
app.include_router(pdf_router) # Include pdf end points
app.include_router(table_router) # Include table end points
app.include_router(image_router) # Include image end points
app.include_router(file_router) # Include file end points

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

# Chroma / HNSW Defaults for hyperparams
# chroma_settings = ChromaSettings(anonymized_telemetry=False)
# hnsw_metadata = {
#     "hnsw:space": "cosine",
#     "hnsw:search_ef": 150,
# }

# Session tracking dict
ACTIVE_SESSIONS = {}  # {session_id: last_activity_timestamp}

# UPLOAD_DIR = "uploaded_files"
OUTPUT_DIR = "output_tables"
# os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)



# Session structure for collection-based vectorstores
# SESSIONS = {}

def initialize_session(session_id: str):
    """Initialize a new session with a default empty collection"""
    if session_id not in SESSIONS:
        # Create default empty vectorstore
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2", 
            model_kwargs={'trust_remote_code': True}
        )
        
        # Create collection directory for default collection
        default_collection_dir = os.path.join(USER_DIRS, session_id, "collections", "default")
        os.makedirs(default_collection_dir, exist_ok=True)
        
        # Create empty vectorstore
        default_vectorstore = Chroma(
            embedding_function=embeddings,
            persist_directory=default_collection_dir
        )
        
        # Create LLM and chatbot chain for default collection
        llm = ChatOllama(model="llama3.1", temperature=0)
        qa_prompt = PromptTemplate(
            input_variables=["context", "question"],
            template="You are a helpful AI assistant. Use the following context to answer the question if available, otherwise answer based on your general knowledge:\n\nContext: {context}\n\nQuestion: {question}\n\nAnswer:"
        )
        
        # Create retriever (will be empty initially)
        retriever = default_vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 2})
        
        # Create chain
        chain = ConversationalRetrievalChain.from_llm(
            llm=llm, 
            retriever=retriever, 
            return_source_documents=True,
            combine_docs_chain_kwargs={"prompt": qa_prompt},
            verbose=True
        )
        
        SESSIONS[session_id] = {
            "collections": {
                "default": {
                    "vectorstore": default_vectorstore,
                    "name": "Default Chat",
                    "files": [],
                    "created_at": time.time(),
                    "embedding_model": "sentence-transformers/all-MiniLM-L6-v2"
                }
            },
            "active_collection_id": "default",
            "history": [],
            "chain": chain
        }

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
                    1. Detect if the user referenced an OSD study (e.g., "study 488", "osd488", "OSD-488").
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
        persist_directory=save_directory,
        client_settings=chroma_settings,
        collection_metadata=hnsw_metadata,
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
    Uses the active collection's vectorstore.
    """
    initialize_session(session_id)

    if (not SESSIONS[session_id].get("active_collection_id") or
        SESSIONS[session_id]["active_collection_id"] not in SESSIONS[session_id]["collections"]):
        raise HTTPException(400, detail="No active collection found. Please load a collection first.")

    active_collection_id = SESSIONS[session_id]["active_collection_id"]
    vectorstore = SESSIONS[session_id]["collections"][active_collection_id]["vectorstore"]

    if vectorstore is None:
        raise HTTPException(status_code=400, detail="Active collection has no vectorstore. Please reingest the collection.")
    
    # Create LLM
    llm = ChatOllama(model="llama3.1", temperature=0)
    
    # Create prompt template
    qa_prompt = PromptTemplate(
    input_variables=["context", "question"], 
    template=textwrap.dedent("""You are a helpful AI. Use the following context to answer the question:
    Context: {context}
    Question: {question}
    Answer:"""))

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
    
    return JSONResponse(content={"status": "success", "active_collection_id": active_collection_id})


class ChatReq(BaseModel):
    query: str
    model: str
    
# Get Chat Response 
@app.post("/api/get_chat_response/{session_id}")
async def get_chat_response(
    session_id: str,
    request: ChatReq
):
    """
    Get a chat response from a chatbot with a specified query and chain.
    Uses the active collection's context, or default vectorstore if no active collection.
    """
    print(f"CHATRESPONSE  called with session_id={session_id}")
    query = request.query
    model = request.model
    
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")
    
    initialize_session(session_id)

    # Get history from Redis
    history = get_session_history(session_id)
    chat_history = []
    messages = history.messages

    # Convert Redis history to LangChain format
    i = 0
    while i < len(messages) - 1:
        if (hasattr(messages[i], 'type') and messages[i].type == "human" and
            hasattr(messages[i + 1], 'type') and messages[i + 1].type == "ai"):
            
            human_content = messages[i].content
            ai_content = messages[i + 1].content
            chat_history.append((human_content, ai_content))
            i += 2  
        else:
            i += 1

    add_chat_message(history, query, "user")

    if "chain" not in SESSIONS[session_id] or SESSIONS[session_id]["chain"] is None:
        # No chain exists, ensure we have the default chain
        active_collection_id = SESSIONS[session_id].get("active_collection_id")
        if not active_collection_id or active_collection_id not in SESSIONS[session_id]["collections"]:
            # Set to default if no valid active collection
            SESSIONS[session_id]["active_collection_id"] = "default"
            active_collection_id = "default"
        
        # Create/recreate chain for the active collection
        vectorstore = SESSIONS[session_id]["collections"][active_collection_id]["vectorstore"]
        llm = ChatOllama(model=model, temperature=0)


        
        qa_prompt = PromptTemplate(
            input_variables=["context", "question"],
            template="""You are a helpful AI assistant. Use the following context to answer the question if available, otherwise answer based on your general knowledge:\n\n
            Context: {context}\n\n
            Question: {question}\n\n
            Answer:"""
        )
        
        retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 2})
        chain = ConversationalRetrievalChain.from_llm(
            llm=llm, 
            retriever=retriever,
            return_source_documents=True,
            combine_docs_chain_kwargs={"prompt": qa_prompt},
            verbose=True,
        )
        SESSIONS[session_id]["chain"] = chain
    
    chain = SESSIONS[session_id]["chain"]

    # Get documents manually and add chat history
    docs = chain.retriever.get_relevant_documents(query)

    # Add chat history as first document if it exists
    if chat_history:
        chat_history_str = ""
        for human, ai in chat_history:
            chat_history_str += f"Human: {human}\nAssistant: {ai}\n\n"
        
        from langchain_core.documents import Document
        history_doc = Document(
            page_content=f"Previous conversation:\n{chat_history_str}",
            metadata={"source": "chat_history"}
        )
        docs = [history_doc] + docs

    # Manually create the context and call the chain's combine_docs_chain
    context = "\n\n".join([doc.page_content for doc in docs])

    # Call the LLM chain directly with the context
    result_text = chain.combine_docs_chain.run(input_documents=docs, question=query)

    # Create result in expected format
    result = {"answer": result_text}
    
    add_chat_message(history, result["answer"], "assistant")

    # Determine context info for response
    active_collection_id = SESSIONS[session_id].get("active_collection_id")
    if active_collection_id and active_collection_id in SESSIONS[session_id]["collections"] and active_collection_id != "default":
        collection_name = SESSIONS[session_id]["collections"][active_collection_id]["name"]
        return JSONResponse(content={
            "answer": result["answer"],
            "active_collection": collection_name,
            "active_collection_id": active_collection_id
        })
    else:
        return JSONResponse(content={
            "answer": result["answer"],
            "active_collection": "General Chat",
            "active_collection_id": None
        })



@app.post("/api/ingest")
async def ingest_collection_endpoint(
    request: Request,
    files: List[UploadFile] = File(...),
    collection_id: str = Form(...),
    collection_name: str = Form(...),
    embedding_model: str = Form("sentence-transformers/all-MiniLM-L6-v2"),
):
    return await ingest_collection(request, files, collection_id, collection_name, embedding_model)


# Collection Management Endpoints
@app.get("/api/collections")
async def list_collections(request: Request):
    """List all collections for the current session (excluding default)"""
    session_id = request.state.session_id
    
    # Initialize session if needed
    initialize_session(session_id)
    
    collections_data = []
    for coll_id, coll_info in SESSIONS[session_id]["collections"].items():
        # Skip the default collection (for background general chat)
        if coll_id == "default":
            continue
            
        collections_data.append({
            "id": coll_id,
            "name": coll_info["name"],
            "files": coll_info["files"],
            "created_at": coll_info["created_at"],
            "is_active": coll_id == SESSIONS[session_id].get("active_collection_id")
        })
    
    return JSONResponse({
        "collections": collections_data,
        "session_id": session_id
    })


@app.post("/api/collections/{collection_id}/load")
async def load_collection(collection_id: str, request: Request):
    """Switch chatbot context to this collection"""
    session_id = request.state.session_id
    
    initialize_session(session_id)
    
    if collection_id not in SESSIONS[session_id]["collections"]:
        raise HTTPException(404, f"Collection {collection_id} not found")
    
    # Set as active collection
    SESSIONS[session_id]["active_collection_id"] = collection_id
    
    # Clear existing chatbot chain (will be recreated with new vectorstore)
    SESSIONS[session_id]["chain"] = None
    
    collection_name = SESSIONS[session_id]["collections"][collection_id]["name"]
    
    return JSONResponse({
        "message": f"Collection '{collection_name}' loaded successfully",
        "active_collection_id": collection_id
    })


@app.get("/api/collections/{collection_id}/export")
async def export_collection(collection_id: str, request: Request):
    """Download collection as zip file"""
    session_id = request.state.session_id
    
    initialize_session(session_id)
    
    if collection_id not in SESSIONS[session_id]["collections"]:
        raise HTTPException(404, f"Collection {collection_id} not found")
    
    collection_info = SESSIONS[session_id]["collections"][collection_id]
    collection_name = collection_info["name"]
    
    # Collection directory path
    collection_dir = os.path.join(USER_DIRS, session_id, "collections", collection_id)
    
    if not os.path.exists(collection_dir):
        raise HTTPException(404, "Collection directory not found")
    
    # Create zip file in memory
    zip_buffer = BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add all files from the collection directory
        for root, dirs, files in os.walk(collection_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arc_name = os.path.relpath(file_path, collection_dir)
                zip_file.write(file_path, arc_name)
    
    zip_buffer.seek(0)
    
    # Clean filename for download
    safe_name = re.sub(r'[^\w\-_.]', '_', collection_name)
    filename = f"{safe_name}_{collection_id}.zip"
    
    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.delete("/api/collections/{collection_id}")
async def delete_collection(collection_id: str, request: Request):
    """Delete collection and its vectorstore"""
    session_id = request.state.session_id
    
    initialize_session(session_id)
    
    if collection_id not in SESSIONS[session_id]["collections"]:
        raise HTTPException(404, f"Collection {collection_id} not found")
    
    collection_name = SESSIONS[session_id]["collections"][collection_id]["name"]
    
    # Remove from session
    del SESSIONS[session_id]["collections"][collection_id]
    
    # If this was the active collection, reset to default
    if SESSIONS[session_id].get("active_collection_id") == collection_id:
        SESSIONS[session_id]["active_collection_id"] = "default"
        # Reset to default chain (already exists from initialize_session)
        default_vectorstore = SESSIONS[session_id]["collections"]["default"]["vectorstore"]
        llm = ChatOllama(model="llama3.1", temperature=0)
        qa_prompt = PromptTemplate(
            input_variables=["context", "question"],
            template="You are a helpful AI assistant. Use the following context to answer the question if available, otherwise answer based on your general knowledge:\n\nContext: {context}\n\nQuestion: {question}\n\nAnswer:"
        )
        retriever = default_vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 2})
        chain = ConversationalRetrievalChain.from_llm(
            llm=llm, 
            retriever=retriever, 
            return_source_documents=True,
            combine_docs_chain_kwargs={"prompt": qa_prompt},
            verbose=True
        )
        SESSIONS[session_id]["chain"] = chain
    
    # Delete collection directory
    collection_dir = os.path.join(USER_DIRS, session_id, "collections", collection_id)
    if os.path.exists(collection_dir):
        shutil.rmtree(collection_dir)
    
    return JSONResponse({
        "message": f"Collection '{collection_name}' deleted successfully"
    })


@app.put("/api/collections/{collection_id}")
async def rename_collection(
    collection_id: str, 
    new_name: str = Body(..., embed=True),
    request: Request = None
):
    """Rename a collection"""
    session_id = request.state.session_id
    
    initialize_session(session_id)
    
    if collection_id not in SESSIONS[session_id]["collections"]:
        raise HTTPException(404, f"Collection {collection_id} not found")
    
    # Update collection name
    SESSIONS[session_id]["collections"][collection_id]["name"] = new_name
    
    return JSONResponse({
        "message": f"Collection renamed to '{new_name}' successfully"
    })


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
    
    initialize_session(session_id)
    
    if (not SESSIONS[session_id].get("active_collection_id") or
        SESSIONS[session_id]["active_collection_id"] not in SESSIONS[session_id]["collections"]):
        raise HTTPException(400, "No active collection found. Please load a collection first.")
    
    active_collection_id = SESSIONS[session_id]["active_collection_id"]
    vectorstore = SESSIONS[session_id]["collections"][active_collection_id]["vectorstore"]

    print(f"!! generate_rag_with_template - session_id: {session_id}, active_collection: {active_collection_id}, has vectorstore: {bool(vectorstore)}")

    # 1) Define structure of Schema Block
    class Biophysics(BaseModel):
            description: str
            title: str
            keywords: List[str]
    
    # 2) Collect top_k chunks for each file
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

    # 3) Prepend any extra instructions
    prompt = (
        "You are a scientific assistant. Respond ONLY with JSON, with no extra text.\n"
        "Based only on the data snippets below, produce valid JSON output strictly following this format:\n\n"
        f"{Biophysics.model_json_schema()}\n\n"  # ← injects the JSON-Schema directly
        "Data snippets:\n"
        f"{context}\n\n"
        "Do NOT include any text before or after the JSON."
    )

    # 4) Call the LLM and use 
    res_text = ollama.chat(
        model=model,
        messages=[{"role":"user","content": prompt}],
        format=Biophysics.model_json_schema(),
    )
    raw = res_text["message"]["content"]

    # using Pydantic check shape that LLM generate, if not correct try up to five times
    for attempt in range(1, 6):
        try:
            result = Biophysics.model_validate_json(raw)
            break   
        except ValidationError as e:
            print(f"Attempt {attempt} failed: {e}")
            if attempt == 6:
                raise HTTPException(500, f"LLM returned invalid schema: {e}")
            # retry—ask the model again, or you could modify `raw` via a repair prompt:
            response = ollama.chat(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                format=Biophysics.model_json_schema(),
            )
            raw = response["message"]["content"]

# At this point `result` is a Biophysics instance
    return JSONResponse(result.model_dump())

class BranchRequest(BaseModel):
    file_names:         List[str]
    template:           Literal["biophysics","geology"]
    model:              str = "llama3.1"
    top_k:              int = 3
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
