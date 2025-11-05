import numpy as np
from datetime import datetime
from app.config.db import get_collection
from app.core.retriever_cache import embedder

async def retrieve_from_conversation_memory(user_id: str, query_text: str, top_k: int = 3):
    """
    Retrieve top-K relevant past conversations for a user.
    Uses semantic similarity on past queries and answers.
    """
    conv_col = get_collection("conversations")

    # Fetch last N conversations (you can adjust limit)
    recent_convs = await conv_col.find({"user_id": user_id}).sort("created_at", -1).to_list(length=200)

    if not recent_convs:
        return []

    # Prepare text corpus
    corpus_texts = [
        f"Q: {c.get('query', '')}\nA: {c.get('answer', '')}"
        for c in recent_convs
    ]
    corpus_embs = [embedder.encode(text).astype(np.float32) for text in corpus_texts]
    query_emb = embedder.encode(query_text).astype(np.float32)

    # Compute cosine similarity
    scores = [float(np.dot(query_emb, emb) / (np.linalg.norm(query_emb) * np.linalg.norm(emb))) for emb in corpus_embs]

    # Rank top conversations
    ranked = sorted(zip(scores, recent_convs), key=lambda x: x[0], reverse=True)
    top_results = [
        {
            "text": f"Q: {conv['query']}\nA: {conv['answer']}",
            "score": score,
            "source": "conversation_memory",
            "created_at": conv.get("created_at")
        }
        for score, conv in ranked[:top_k]
    ]

    return top_results
