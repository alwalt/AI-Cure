# rag_calls/api_rag_calls.py
from fastapi import APIRouter, Request, Body, Depends
from rag_calls.models import SingleRagRequest, DescriptionResponse, TitleResponse, KeywordsResponse 
from dependencies.llm import get_llm
from dependencies.vectorstore import get_vectorstore

router = APIRouter(tags=["rag"])

@router.post("/api/generate_rag_with_description", response_model=DescriptionResponse)
async def generate_rag_with_description(
    # request: Request,
    # raw_body: dict = Body(...),
    payload: SingleRagRequest = Body(...),
    # llm = Depends(get_llm),
    # vs  = Depends(get_vectorstore),
):
    #  placeholder
    # result = await llm.rag_describe(vs, payload) 
    # raw_body = await request.json()
    # print("💥 RAW BODY:", raw_body)
    # print("💥 PARSED PAYLOAD:", payload)
    print("!!! HIT Description Route !!!")
    result = "description route hit"
    return {"description": result}

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
    result = "keywords route hit"
    return {"keywords": result}