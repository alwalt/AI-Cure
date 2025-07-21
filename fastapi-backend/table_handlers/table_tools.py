from fastapi import APIRouter, Request, Body, Depends, HTTPException, Form
from fastapi.responses import JSONResponse
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
from file_handlers.file_tools import SESSION_TABLES
import uuid

from utils import create_table_summary_prompt, segment_and_export_tables, clean_dataframe, get_magic_wand_suggestions

router = APIRouter(tags=["table"])



# Table Analyzer
@router.post("/api/analyze_table")
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



@router.post("/api/export_subset")
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



@router.get("/api/list_tables/{session_id}")
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

@router.get("/api/preview_table")
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

