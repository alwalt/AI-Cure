# rag_calls/rag_calls.py
from fastapi import APIRouter, Request, Body, Depends
from .models import BranchRequest
from dependencies.llm import get_llm
from dependencies.vectorstore import get_vectorstore

router = APIRouter(tags=["rag"])

@router.post("/api/generate_rag_with_description")
async def generate_rag_with_description(
    request: Request,
    payload: BranchRequest = Body(...),
    llm = Depends(get_llm),
    vs  = Depends(get_vectorstore),
):
    result = await llm.rag_describe(vs, payload)
    return {"description": result}

@router.post("/api/generate_rag_with_title")
async def generate_rag_with_title(
    request: Request,
    payload: BranchRequest = Body(...),
    llm = Depends(get_llm),
    vs  = Depends(get_vectorstore),
):
    result = await llm.rag_title(vs, payload)
    return {"title": result}

@router.post("/api/generate_rag_with_keywords")
async def generate_rag_with_keywords(
    request: Request,
    payload: BranchRequest = Body(...),
    llm = Depends(get_llm),
    vs  = Depends(get_vectorstore),
):
    result = await llm.rag_keywords(vs, payload)
    return {"keywords": result}