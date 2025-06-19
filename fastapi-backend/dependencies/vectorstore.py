# dependencies/vectorstore.py
from fastapi import Request, HTTPException
from rag_calls.models import BranchRequest
from main import VECTOR_STORES


def get_vectorstore(request: Request):
    """
    FastAPI dependency that looks up the vectorstore instance for
    the current session_id.  We import VECTOR_STORES inside the
    function to avoid circular imports.
    """
    # assumes you have middleware or earlier dependency that has done:
    #    request.state.session_id = "<the user's session id>"
    session_id = request.state.session_id

    # now pull in the dict at runtime
    from main import VECTOR_STORES  

    vs = VECTOR_STORES.get(session_id)
    if vs is None:
        raise HTTPException(
            status_code=400,
            detail=f"Vector store not initialized for session {session_id}"
        )
    return vs