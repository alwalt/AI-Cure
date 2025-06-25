# rag_calls/api_rag_calls.py
from fastapi import APIRouter, Request, Body, Depends, HTTPException
from fastapi.responses import JSONResponse
from rag_calls.models import SingleRagRequest, DescriptionResponse, TitleResponse, KeywordsResponse 
from dependencies.llm import get_llm
from dependencies.vectorstore import get_vectorstore
from pydantic import ValidationError

router = APIRouter(tags=["rag"])

@router.post("/api/generate_rag_with_description", response_model=DescriptionResponse)
async def generate_rag_with_description(
    # request: Request,
    # raw_body: dict = Body(...),
    payload: SingleRagRequest = Body(...),
    llm = Depends(get_llm),
    vs  = Depends(get_vectorstore),
):
    #  logic for getting description
    file_names = payload.file_names

    def rag_description(vs, payload):
        # 1  Collect top_k chunks for each file
        all_chunks = []
        for name in file_names:
            docs = vs.similarity_search(
                query=f"Fetch context for '{name}'",
                k=payload.top_k,
                filter={"source": name}
            )
            if docs:
                all_chunks.extend(docs)
                print("!!!! docs", docs)
                print()

        if not all_chunks:
            raise HTTPException(404, "No data chunks found for any requested files")

        context = "\n\n".join(d.page_content for d in all_chunks)

        print("!!!! CONTEXT !!!", context)

        # 2 Prepare the instructions - use Char's insrtuctions
        prompt = (
            "You are an expert at reading scientific articles.  Your task is to write a comprehensive one paragraph summary of the scientific article. The summary should include the scientific assays used, factors studied, results.\n"
            "Based only on the data snippets below, produce valid JSON output strictly following this format:\n\n"
            "Respond ONLY with JSON, with no extra text.\n"
            "Based only on the data snippets below, produce valid JSON output strictly following this format:\n\n"
            f"{DescriptionResponse.model_json_schema()}\n\n"  # ← injects the JSON-Schema directly
            "Data snippets:\n"
            f"{context}\n\n"
            "Do NOT include any text before or after the JSON."
        )

        # 4 Call the LLM and use
        res_text = llm.chat(
            model=payload.model,
            messages=[{"role":"user","content": prompt}],
            format=DescriptionResponse.model_json_schema(),
        )
        raw = res_text["message"]["content"]
        # 5 Compare shape that LLM gens, if not correct try again, 5 attempts
        for attempt in range(1, 6):
            try:
                result = DescriptionResponse.model_validate_json(raw)
                break   
            except ValidationError as e:
                print(f"Attempt {attempt} failed: {e}")
                if attempt == 6:
                    raise HTTPException(500, f"LLM returned invalid schema: {e}")
                # retry—ask the model again, or you could modify `raw` via a repair prompt:
                response = llm.chat(
                    model=payload.model,
                    messages=[{"role":"user","content": prompt}],
                    format=DescriptionResponse.model_json_schema(),
                )
                raw = response["message"]["content"]

        # 6 Return JSON res
        return result.model_dump()


    rag_result = rag_description(vs, payload) 
    print("!!! HIT Description Route !!!")
   
    return rag_result

@router.post("/api/generate_rag_with_title", response_model=TitleResponse)
async def generate_rag_with_title(
    request: Request,
    payload: SingleRagRequest = Body(...),
    llm = Depends(get_llm),
    vs  = Depends(get_vectorstore),
):
    # result = await llm.rag_title(vs, payload)
    result = "test title route hit"
    return {"title": result}

@router.post("/api/generate_rag_with_keywords", response_model=KeywordsResponse)
async def generate_rag_with_keywords(
    request: Request,
    payload: SingleRagRequest = Body(...),
    llm = Depends(get_llm),
    vs  = Depends(get_vectorstore),
):
    # result = await llm.rag_keywords(vs, payload)
    #  logic for getting description
    file_names = payload.file_names

    def rag_description(vs, payload):
        # 1  Collect top_k chunks for each file
        all_chunks = []
        for name in file_names:
            docs = vs.similarity_search(
                query=f"Fetch context for '{name}'",
                k=payload.top_k,
                filter={"source": name}
            )
            if docs:
                all_chunks.extend(docs)

        if not all_chunks:
            raise HTTPException(404, "No data chunks found for any requested files")

        context = "\n\n".join(d.page_content for d in all_chunks)

        # 2 Prepare the instructions - use Char's insrtuctions
        prompt = (
           "Summarize the text given. Output in a JSON with the following format: {\"Keywords\":[\"keyword_1\", \"keyword_2\"]}" + f"Here is the text: {context}"
            "Do NOT include any text before or after the JSON."
        )

        # 4 Call the LLM and use
        res_text = llm.chat(
            model=payload.model,
            messages=[{"role":"user","content": prompt}],
            format=KeywordsResponse.model_json_schema(),
        )
        raw = res_text["message"]["content"]
        # 5 Compare shape that LLM gens, if not correct try again, 5 attempts
        for attempt in range(1, 6):
            try:
                result = KeywordsResponse.model_validate_json(raw)
                break   
            except ValidationError as e:
                print(f"Attempt {attempt} failed: {e}")
                if attempt == 6:
                    raise HTTPException(500, f"LLM returned invalid schema: {e}")
                # retry—ask the model again, or you could modify `raw` via a repair prompt:
                response = llm.chat(
                    model=payload.model,
                    messages=[{"role":"user","content": prompt}],
                    format=KeywordsResponse.model_json_schema(),
                )
                raw = response["message"]["content"]

        # 6 Return JSON res
        return result.model_dump()


    rag_result = rag_description(vs, payload) 
    print("!!! HIT Description Route !!!")
   
    return rag_result
    return {"keywords": result}