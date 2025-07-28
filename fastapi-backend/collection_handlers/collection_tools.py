from fastapi import APIRouter, Request, Body, Depends, HTTPException, Form
from fastapi.responses import JSONResponse, Response
from rag_calls.models import SingleRagRequest, DescriptionResponse, TitleResponse, KeywordsResponse 
from dependencies.llm import get_llm
from dependencies.vectorstore import get_vectorstore
from pydantic import ValidationError
from starlette.concurrency import run_in_threadpool
import logging
import pandas as pd
import ollama
import re
import json
import uuid
import os
import time
from io import BytesIO
import zipfile
import shutil


from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import ConversationalRetrievalChain
from langchain_ollama import ChatOllama
from langchain.prompts import PromptTemplate

from file_handlers.file_tools import USER_DIRS

router = APIRouter(tags=["collections"])

# Session structure for collection-based vectorstores
SESSIONS = {}

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


# Collection Management Endpoints
@router.get("/api/collections")
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


@router.post("/api/collections/{collection_id}/load")
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


@router.get("/api/collections/{collection_id}/export")
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


@router.delete("/api/collections/{collection_id}")
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


@router.put("/api/collections/{collection_id}")
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

