import numpy as np
from datetime import datetime
from app.config.db import get_collection
from app.core.retriever_cache import embedder
from bson import ObjectId
from typing import Optional


async def retrieve_from_conversation_memory(
    user_id: str,
    query_text: str,
    top_k: int = 3,
    domain: Optional[str] = None
):
    """
    Retrieve top-K relevant past conversations for a user.
    Tries pre-stored embeddings (fast). Falls back to compute if missing.
    """
    conv_col = get_collection("conversations")

    # Fetch recent user conversations
    recent_convs = await conv_col.find({"user_id": user_id, "answer": {"$ne": ""}, "domain": domain if domain else {"$exists": False}}).sort("created_at", -1).to_list(length=200)
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
        corpus_texts.append(f"Q: {c.get('query', '')}\nA: {c.get('answer', '')}\nComments: {c.get('comments', [])}")

    # Compute cosine similarity
    scores = [float(np.dot(query_emb, emb) / (np.linalg.norm(query_emb) * np.linalg.norm(emb))) for emb in corpus_embs]
    ranked = sorted(zip(scores, recent_convs, corpus_texts), key=lambda x: x[0], reverse=True)

    top_results = [
        {
            "text": corpus_text,
            "score": score,
            "source": "conversation_memory",
            "conversation_id": str(conv.get("_id")),
            "original_query": conv.get("query", ""),
            "document_type": "conversation" ,
            "created_at": conv.get("created_at")
        }
        for score, conv, corpus_text in ranked[:top_k]
    ]
    try:
        chats_col = get_collection("chats")
        latest_chat_list = await chats_col.find({
            "user_id": user_id
        }).sort("updated_at", -1).limit(1).to_list(length=1)
        if latest_chat_list:
            latest_chat = latest_chat_list[0]
            conv_refs = latest_chat.get("conversations", [])
            prev_two_ids = [ref.get("conversation_id") for ref in conv_refs if ref.get("conversation_id")][:2]
            existing_ids = {item.get("conversation_id") for item in top_results}
            extra_items = []
            for conv_id in prev_two_ids:
                if not conv_id or conv_id in existing_ids:
                    continue
                conv_doc = await conv_col.find_one({"_id": ObjectId(conv_id)})
                if not conv_doc:
                    continue
                text = f"Q: {conv_doc.get('query', '')}\nA: {conv_doc.get('answer', '')}\nComments: {conv_doc.get('comments', [])}"
                extra_items.append({
                    "text": text,
                    "score": 0.0,
                    "source": "conversation_memory",
                    "conversation_id": str(conv_doc.get("_id")),
                    "original_query": conv_doc.get("query", ""),
                    "document_type": "conversation",
                    "created_at": conv_doc.get("created_at")
                })
            if extra_items:
                top_results = extra_items + top_results
    except Exception:
        pass

    return top_results
