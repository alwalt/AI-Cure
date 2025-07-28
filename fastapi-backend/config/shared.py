# fastapi-backend/config/shared.py
"""
Shared configuration and session management to avoid circular imports
"""
import os
import time
from typing import Dict, Any
from chromadb.config import Settings
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.chat_models import ChatOllama
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate
from fastapi import Body, HTTPException
from rag_calls.models import SingleRagRequest

# Global session storage
SESSIONS: Dict[str, Dict[str, Any]] = {}

def initialize_session(session_id: str):
    """Initialize a new session with a default empty collection"""
    if session_id not in SESSIONS:
        # Import USER_DIRS here to avoid circular imports
        from file_handlers.file_tools import USER_DIRS
        
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
            persist_directory=default_collection_dir,
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
        print(f"DEBUG: Initialized new session {session_id} with default collection")

# Chroma settings - updated for new Chroma version
chroma_settings = Settings(
    persist_directory="./chroma_db",
    anonymized_telemetry=False,
)

# HNSW metadata - updated for new Chroma version
hnsw_metadata = {
    "hnsw:space": "cosine",
    "hnsw:construction_ef": 100,
    "hnsw:M": 16,
}