
from app.core.retriever_cache import embedder


def generate_embeddings(text: str):
  return embedder.encode(text).tolist()