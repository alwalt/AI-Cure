from fastapi import APIRouter, Request, Body, Depends, HTTPException, Form
from fastapi.responses import JSONResponse
from rag_calls.models import SingleRagRequest, DescriptionResponse, TitleResponse, KeywordsResponse 
from dependencies.llm import get_llm
from dependencies.vectorstore import get_vectorstore
from pydantic import ValidationError
from starlette.concurrency import run_in_threadpool

router = APIRouter(tags=["pdf"])


# PDF Analyzer
@router.post("/api/analyze_pdf")
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