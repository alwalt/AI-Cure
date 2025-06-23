# rag_calls/models.py
from pydantic import BaseModel
from typing import List, Optional

class BranchRequest(BaseModel):
    session_id: str
    file_names:       List[str]
    model:            str = "llama3.1"
    top_k:            int    = 3
    extra_instructions: str | None = None

class DescriptionResponse(BaseModel):
    description: str

class TitleResponse(BaseModel):
    title: str

class KeywordsResponse(BaseModel):
    keywords: List[str]

class SingleRagRequest(BaseModel):
    session_id: str
    file_names: List[str]
    model: str = "llama3.1"
    top_k: int   = 3
    extra_instructions: str = ""
