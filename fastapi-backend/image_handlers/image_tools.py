from fastapi import APIRouter, Request, Body, Depends, HTTPException, Form
from fastapi.responses import JSONResponse
from rag_calls.models import SingleRagRequest, DescriptionResponse, TitleResponse, KeywordsResponse 
from dependencies.llm import get_llm
from dependencies.vectorstore import get_vectorstore
from pydantic import ValidationError
from starlette.concurrency import run_in_threadpool
import os
import ollama
import json
from file_handlers.file_tools import USER_DIRS, JSON_DIRS

router = APIRouter(tags=["image"])


# Image Analyzer
@router.post("/api/analyze_image")
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


