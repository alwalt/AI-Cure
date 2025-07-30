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

# For detailed assay res, instead of `str` in AssayResponse,
# do     assays: list[AssayDetail]
class AssayDetail(BaseModel):
    name: str
    purpose: str
    target_proteins: list[str] = []
    methodology: str = ""
    key_parameters: dict[str, str] = {}

class AssaysResponse(BaseModel):
    assays: str

class SingleRagRequest(BaseModel):
    session_id: str
    file_names: List[str]
    model: str = "llama3.1"
    top_k: int   = 3
    extra_instructions: str = ""
