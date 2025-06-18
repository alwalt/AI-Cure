# dependencies/vectorstore.py
from fastapi import Request, HTTPException
from main import SESSIONS

def get_vectorstore(request: Request):
    session_id = request.state.session_id  # assume you set this in middleware
    session = SESSIONS.get(session_id)
    vs = session and session.get("vectorstore")
    if vs is None:
        raise HTTPException(400, "Vectorstore not initialized for this session")
    return vs