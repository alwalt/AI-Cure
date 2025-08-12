# rag_calls/api_rag_calls.py
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.responses import JSONResponse
from rag_calls.models import SingleRagRequest, DescriptionResponse, TitleResponse, KeywordsResponse, AssaysResponse 
from dependencies.llm import get_llm
from config.shared import get_vectorstore
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
    payload: SingleRagRequest = Body(...),
    llm = Depends(get_llm),
    vs  = Depends(get_vectorstore),
):
    # 1) Define your extraction job and JSON schema up front
    instruction_block = (
        "Your task is to extract the article's exact title as it appears at the top of the paper. "
        "Respond ONLY with JSON, following this schema:\n\n"
        f"{TitleResponse.model_json_schema()}\n\n"
    )

    # 2) Let the LLM refine that into a concise search query
    refine_resp = await run_in_threadpool(
        llm.chat,
        model=payload.model,
        messages=[{
            "role": "user",
            "content": (
                instruction_block
            )
        }],
    )
    search_query = refine_resp["message"]["content"].strip().strip('"')

    # 3) Pull top-k chunks (with scores) for each file
    docs_and_scores = []
    for src in payload.file_names:
        docs_and_scores.extend(
            vs.similarity_search_with_score(
                query=search_query,
                k=payload.top_k,
                filter={"source": src},
            )
        )

    if not docs_and_scores:
        raise HTTPException(404, "No document chunks found to extract a title")

    # 3a) Pick the best chunk (highest score) as the likeliest title snippet
    docs_and_scores.sort(key=lambda pair: pair[1], reverse=True)
    best_doc = docs_and_scores[0][0]

    # 4) Build context using just that one snippet (which should contain the title)
    context = best_doc.page_content

    # 5) Final LLM call to format the JSON title
    final_prompt = (
        instruction_block +
        "Data snippet:\n" + context + "\n\n"
        "Do NOT include any text before or after the JSON."
    )
    res = await run_in_threadpool(
        llm.chat,
        model=payload.model,
        messages=[{"role": "user", "content": final_prompt}],
        format=TitleResponse.model_json_schema(),
    )
    raw = res["message"]["content"]

    # 6) Validate & retry up to 5× on malformed JSON
    for attempt in range(1, 6):
        try:
            result = TitleResponse.model_validate_json(raw)
            break
        except ValidationError as e:
            if attempt == 5:
                raise HTTPException(500, f"LLM returned invalid title schema: {e}")
            retry = await run_in_threadpool(
                llm.chat,
                model=payload.model,
                messages=[{"role": "user", "content": final_prompt}],
                format=TitleResponse.model_json_schema(),
            )
            raw = retry["message"]["content"]

    return result.model_dump()


@router.post("/api/generate_rag_with_keywords", response_model=KeywordsResponse)
async def generate_rag_with_keywords(
    payload: SingleRagRequest = Body(...),
    llm = Depends(get_llm),
    vs  = Depends(get_vectorstore),
):
    # 1) Build the “job” instruction
    instruction_block = (
        "You are an expert at reading scientific articles. "
        "Your task is to extract 4-6 key topical terms from the study. "
        "Respond ONLY with JSON, following this schema:\n\n"
        f"{KeywordsResponse.model_json_schema()}\n\n"
    )

    # 2) Let the LLM refine that into a focused search query
    refine_resp = await run_in_threadpool(
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
    search_query = refine_resp["message"]["content"].strip().strip('"')

    # 3) Gather top‐k docs + scores per file
    docs_and_scores_all: list[tuple] = []
    for src in payload.file_names:
        ds = vs.similarity_search_with_score(
            query=search_query,
            k=payload.top_k,
            filter={"source": src},
        )
        docs_and_scores_all.extend(ds)

    if not docs_and_scores_all:
        raise HTTPException(404, "No documents found for any of the requested files")

    # 3a) apply score threshold
    filtered = [doc for doc, score in docs_and_scores_all if score >= 0.65]
    # 3b) fallback if nothing passes
    if not filtered:
        filtered = [doc for doc, _ in docs_and_scores_all]

    # 4) Build context
    context = "\n\n".join(d.page_content for d in filtered)

    # 5) Final prompt for keywords extraction
    final_prompt = (
        instruction_block +
        "Data snippets:\n" + context + "\n\n"
        "Do NOT include any extra text."
    )
    res = await run_in_threadpool(
        llm.chat,
        model=payload.model,
        messages=[{"role": "user", "content": final_prompt}],
        format=KeywordsResponse.model_json_schema(),
    )
    raw = res["message"]["content"]

    # 6) Validate & retry up to 5×
    for attempt in range(1, 6):
        try:
            result = KeywordsResponse.model_validate_json(raw)
            break
        except ValidationError as e:
            if attempt == 5:
                raise HTTPException(500, f"LLM returned invalid schema after 5 tries: {e}")
            # retry
            retry = await run_in_threadpool(
                llm.chat,
                model=payload.model,
                messages=[{"role": "user", "content": final_prompt}],
                format=KeywordsResponse.model_json_schema(),
            )
            raw = retry["message"]["content"]

    return result.model_dump()


@router.post("/api/generate_rag_with_assays", response_model=AssaysResponse)
async def generate_rag_with_assays(
    payload: SingleRagRequest = Body(...),
    llm = Depends(get_llm),
    vs  = Depends(get_vectorstore),
):
    # 1) Build the "job" instruction
    instruction_block = (
    "You are an expert at reading scientific articles. "
    "Your task is to identify and extract all experimental assays used in the study. "
    "An assay is a laboratory procedure or test designed to measure, detect, or analyze a specific biological component or process (e.g., Western Blotting, ELISA, PCR, Calcium Uptake, Cell viability). "
    "Do NOT include sample preparation steps, statistical methods, general procedures, or descriptions. "
    "Return each assay name as a separate string in the 'assays' array. "
    "Respond ONLY with JSON, following this schema:\n\n"
    f"{AssaysResponse.model_json_schema()}\n\n"
)

    # 2) Let the LLM refine that into a focused search query
    refine_resp = await run_in_threadpool(
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
    search_query = refine_resp["message"]["content"].strip().strip('"')

    # 3) Gather top‐k docs + scores per file
    docs_and_scores_all: list[tuple] = []
    for src in payload.file_names:
        ds = vs.similarity_search_with_score(
            query=search_query,
            k=payload.top_k,
            filter={"source": src},
        )
        docs_and_scores_all.extend(ds)

    if not docs_and_scores_all:
        raise HTTPException(404, "No documents found for any of the requested files")

    # 3a) apply score threshold
    filtered = [doc for doc, score in docs_and_scores_all if score >= 0.65]
    # 3b) fallback if nothing passes
    if not filtered:
        filtered = [doc for doc, _ in docs_and_scores_all]

    # 4) Build context
    context = "\n\n".join(d.page_content for d in filtered)

    # 5) Final prompt for assays extraction
    final_prompt = (
        instruction_block +
        "Data snippets:\n" + context + "\n\n"
        "Do NOT include any extra text."
    )
    res = await run_in_threadpool(
        llm.chat,
        model=payload.model,
        messages=[{"role": "user", "content": final_prompt}],
        format=AssaysResponse.model_json_schema(),
    )
    raw = res["message"]["content"]

    # 6) Validate & retry up to 5×
    for attempt in range(1, 6):
        try:
            result = AssaysResponse.model_validate_json(raw)
            break
        except ValidationError as e:
            if attempt == 5:
                raise HTTPException(500, f"LLM returned invalid schema after 5 tries: {e}")
            # retry
            retry = await run_in_threadpool(
                llm.chat,
                model=payload.model,
                messages=[{"role": "user", "content": final_prompt}],
                format=AssaysResponse.model_json_schema(),
            )
            raw = retry["message"]["content"]

    return result.model_dump()