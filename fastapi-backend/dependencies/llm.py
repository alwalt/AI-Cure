# dependencies/llm.py
from ollama import ChatOllama

_llm_client = ChatOllama(model="llama3.1", temperature=0)

# will configure llm to users choices, default is llama3.1
def get_llm():
    """
    FastAPI dependency that returns a ChatOllama client.
    Later you could do:
      def get_llm(model_name: str = Body("llama3.1"), temp: float = Body(0)):
          return ChatOllama(model=model_name, temperature=temp)
    """
    return _llm_client