import numpy as np
from datetime import datetime
from app.config.db import get_collection
from app.core.retriever_cache import embedder

async def retrieve_from_conversation_memory(user_id: str, query_text: str, top_k: int = 3):
    """
    Retrieve top-K relevant past conversations for a user.
    Tries pre-stored embeddings (fast). Falls back to compute if missing.
    """
    conv_col = get_collection("conversations")

    # Fetch recent user conversations
    recent_convs = await conv_col.find({"user_id": user_id}).sort("created_at", -1).to_list(length=200)
    if not recent_convs:
        return []

    query_emb = embedder.encode(query_text).astype(np.float32)

    corpus_texts, corpus_embs = [], []
    for c in recent_convs:
        emb = c.get("embedding")
        if emb:
            corpus_embs.append(np.array(emb, dtype=np.float32))
        else:
            text = f"Q: {c.get('query', '')}\nA: {c.get('answer', '')}"
            corpus_embs.append(embedder.encode(text).astype(np.float32))
        corpus_texts.append(f"Q: {c.get('query', '')}\nA: {c.get('answer', '')}")

    # Compute cosine similarity
    scores = [float(np.dot(query_emb, emb) / (np.linalg.norm(query_emb) * np.linalg.norm(emb))) for emb in corpus_embs]
    ranked = sorted(zip(scores, recent_convs, corpus_texts), key=lambda x: x[0], reverse=True)

    top_results = [
        {
            "text": corpus_text,
            "score": score,
            "source": "conversation_memory",
            "created_at": conv.get("created_at")
        }
        for score, conv, corpus_text in ranked[:top_k]
    ]
    return top_results
