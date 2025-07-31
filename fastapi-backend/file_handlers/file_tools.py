from fastapi import APIRouter, Request, UploadFile, File, Depends, HTTPException, Form
from fastapi.responses import FileResponse, JSONResponse, Response
from rag_calls.models import SingleRagRequest, DescriptionResponse, TitleResponse, KeywordsResponse 
from dependencies.llm import get_llm
from dependencies.vectorstore import get_vectorstore
from pydantic import ValidationError
from starlette.concurrency import run_in_threadpool
import logging
import os
import ollama
import json
import shutil

from utils import segment_and_export_tables

router = APIRouter(tags=["files"])


# Add to config
USER_DIRS = "user_uploads"
JSON_DIRS = "cached_jsons"

# { session_id -> [ (csv_file, name), ... ] }
SESSION_TABLES = {}


@router.get("/api/get_file/{filename}")
async def get_file(filename: str, request: Request):
    session_id = request.state.session_id
    file_path = os.path.join(USER_DIRS, session_id, filename)
    print(file_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)

@router.get("/api/get_session_files")
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

@router.post("/api/clear_files")
async def clear_files(request: Request):
    session_id = request.state.session_id
    
    # Clear tables reference (but keep vectorstore)
    SESSION_TABLES[session_id] = []
    
    # Clear only FILES, preserve directories like chroma_db
    UPLOAD_DIR = os.path.join(USER_DIRS, session_id)
    if os.path.exists(UPLOAD_DIR):
        for item in os.listdir(UPLOAD_DIR):
            item_path = os.path.join(UPLOAD_DIR, item)
            if os.path.isfile(item_path): 
                os.remove(item_path)

    return JSONResponse(content={"status": "success"})

@router.post("/api/upload_file")
async def upload_file(request: Request, file: UploadFile = File(...), file_type: str = Form(...)):
    """
    Upload a file and return a session id. Unless sessionid is present.
    """
  
    session_id = request.state.session_id
    UPLOAD_DIR = os.path.join(USER_DIRS, session_id)
    
    try:
        logging.info(f"Starting upload for session: {session_id}")

        if file_type == "excel" or file_type == "xlsx":
            file_ext = file.filename.split(".")[-1]
            unique_name = f"{file.filename}"
            file_path = os.path.join(UPLOAD_DIR, unique_name)
        
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            logging.info("File saved, processing tables...")
            table_info = segment_and_export_tables(file_path, session_id)
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
        # ADD THESE NEW SECTIONS:
        elif file_type == "pptx" or file.content_type == "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            file_name = file.filename
            unique_name = f"{file_name}"
            file_path = os.path.join(UPLOAD_DIR, unique_name)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            response_data = {
                "file_name": file_name
            }
        elif file_type == "doc" or file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or file.content_type == "application/msword":
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