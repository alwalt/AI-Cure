# dependencies/vectorstore.py
from fastapi import Request, Depends, HTTPException
from rag_calls.models import SingleRagRequest
# from main import VECTOR_STORES


def get_vectorstore(payload: SingleRagRequest = Depends()):
    """
    FastAPI dependency that looks up the vectorstore instance for
    the current session_id.  We import VECTOR_STORES inside the
    function to avoid circular imports.
    """

    session_id = payload.session_id
    print("SESSION_ID FROM VECTORSTORE>PY !!!", session_id)
    from main import SESSIONS
    
    # session = SESSIONS.get(session_id)
    # vs = session.get("vectorstore")
    vs = SESSIONS.get(session_id, {}).get("vectorstore")

    print("Checking vector store!!!: ", vs)
    if vs is None:
        raise HTTPException(
            status_code=400,
            detail=f"Vector store not initialized for session {session_id}"
        )
    return vs