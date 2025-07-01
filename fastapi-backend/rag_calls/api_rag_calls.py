# rag_calls/api_rag_calls.py
from fastapi import APIRouter, Request, Body, Depends, HTTPException
from fastapi.responses import JSONResponse
from rag_calls.models import SingleRagRequest, DescriptionResponse, TitleResponse, KeywordsResponse 
from dependencies.llm import get_llm
from dependencies.vectorstore import get_vectorstore
from pydantic import ValidationError
from starlette.concurrency import run_in_threadpool

router = APIRouter(tags=["rag"])

@router.post("/api/generate_rag_with_description", response_model=DescriptionResponse)
async def generate_rag_with_description(
    # request: Request,
    # raw_body: dict = Body(...),
    payload: SingleRagRequest = Body(...),
    llm = Depends(get_llm),
    vs  = Depends(get_vectorstore),
):
    # 1) Define the “job” you want the LLM to do
    instruction_block = (
        "You are an expert at reading scientific articles. "
        "Your task is to write a comprehensive one-paragraph summary of the study, "
        "including assays used, factors studied, and key results. "
        "Respond ONLY with JSON, following this schema:\n\n"
        f"{DescriptionResponse.model_json_schema()}\n\n"
    )

    # 2) Let the LLM refine that into a focused search query
    #    Let the LLM build the query in terms it understands 
    refined_query_resp = await run_in_threadpool(
        llm.chat,
        model=payload.model,
        messages=[{
            "role": "user",
            "content": (
                instruction_block +
                "Based on the above, suggest a concise search query (2-5 words)."
            )
        }],
    )
    search_query = refined_query_resp["message"]["content"].strip().strip('"')
    
    # 3) Do your similarity search using the refined query
    all_docs = []
    for name in payload.file_names:
        docs_and_scores = vs.similarity_search_with_score(
            query=search_query,
            k=payload.top_k,
            filter={"source": name},  # if you’re filtering by source
        )
        # unpack raw docs
        docs = [doc for doc, _ in docs_and_scores]
        if docs:
            all_docs.extend(docs)

        # 3a) apply your threshold
        filtered_docs = [doc for doc, score in docs_and_scores if score >= 0.65]
        # 3b) fallback to at least something if none pass
        if not filtered_docs:
            filtered_docs = [doc for doc, _ in docs_and_scores]

    # 4) build context
    context = "\n\n".join(d.page_content for d in filtered_docs)
    print("!!!! !!!! Context: ", context)

    # 5) Now call the LLM one final time to produce your JSON summary
    final_prompt = (
        instruction_block +
        "Data snippets:\n" + context + "\n\n"
        "Do NOT include any extra text."
    )
    res = await run_in_threadpool(
        llm.chat,
        model=payload.model,
        messages=[{"role":"user","content": final_prompt}],
        format=DescriptionResponse.model_json_schema(),
    )
    raw = res["message"]["content"]

    # 6) Validate & return
    for attempt in range(1, 6):
        try:
            result = DescriptionResponse.model_validate_json(raw)
            break
        except ValidationError:
            if attempt == 5:
                raise HTTPException(500, "LLM returned invalid schema after 5 tries")
            # re-run the LLM call exactly as before
            response = await run_in_threadpool(
            llm.chat,
            model=payload.model,
            messages=[{"role":"user","content": final_prompt}],
            format=DescriptionResponse.model_json_schema(),
            )
            raw = response["message"]["content"]

    return result.model_dump()



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