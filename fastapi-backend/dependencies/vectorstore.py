# fastapi-backend/dependencies/vectorstore.py
from fastapi import Body, Request, Depends, HTTPException
from rag_calls.models import SingleRagRequest
# from main import VECTOR_STORES


def get_vectorstore(payload: SingleRagRequest = Body(...)):
    """
    FastAPI dependency that looks up the vectorstore instance for
    the current session_id.  We import VECTOR_STORES inside the
    function to avoid circular imports.
    """

    session_id = payload.session_id
    print("SESSION_ID FROM VECTORSTORE>PY !!!", session_id)
    from main import SESSIONS
    
    session = SESSIONS.get(session_id)
    if session is None:
        raise HTTPException(400, f"Unknown session {session_id}")

    # 1) Which collection is currently active?
    coll_id = session.get("active_collection_id")
    collections = session.get("collections", {})
    coll = collections.get(coll_id)
    if coll is None:
        raise HTTPException(400, f"No collection '{coll_id}' in session {session_id}")

    # 2) Pull the vectorstore out of that collection
    vs = coll.get("vectorstore")

    print("Checking vector store!!!: ", vs)
    if vs is None:
        raise HTTPException(
            status_code=400,
            detail=f"Vector store not initialized for session {session_id}"
        )
    return vs