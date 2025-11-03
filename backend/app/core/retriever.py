# ============================================
# retriever.py
# ============================================

import os
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import traceback
from app.config.db import get_collection
from app.core.retriever_cache import embedder

# For backward compatibility
class DummyIndex:
    @property
    def ntotal(self):
        return 0

index = DummyIndex()

async def _recency_score(created_at: datetime) -> float:
    """Compute recency bonus (0–1). Newer chunks rank higher."""
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    age_days = (datetime.utcnow() - created_at).days
    return max(0, 1 - (age_days / 365))

async def retrieve_similar(query_text: str, user_id: str = None, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Retrieve top-K document chunks relevant to the query from all KBs.
    Args:
        query_text: The search query
        user_id: Optional user ID for filtering
        top_k: Number of results to return
    Returns:
        List of dictionaries containing document chunks and metadata
    """
    try:
        print(f"🔍 Starting search for: '{query_text}'")
        query_emb = embedder.encode(query_text).astype("float32")
        results = []
        # Get user's document IDs if user_id is provided
        user_doc_ids = []

        document_collection = get_collection("documents")
        user_documents = document_collection.find({"user_id": user_id})
        user_docs = await user_documents.to_list(length=100)  # Adjust limit as needed
        
        # Extract all chunk document IDs
        for doc in user_docs:
            if "chunk_docs_ids" in doc:
                user_doc_ids.extend(doc["chunk_docs_ids"])
        
        print(f"🔑 Found {len(user_doc_ids)} document chunks for user {user_id}")
        
        # Search across all knowledge bases
        for kb_name in ["student", "coaching", "general"]:
            print(f"\n🔎 Searching in {kb_name} collection...")
            collection = get_collection(f"kb_{kb_name}")
            
            # Try without user filter first
            query_filter = {}
            if user_doc_ids:  # Only filter by user's documents if we have any
                query_filter["_id"] = {"$in": user_doc_ids}
                        
            try:
                # First, check if collection has any documents
                count = await collection.count_documents({})
                print(f"  Total documents in collection: {count}")
                
                if count == 0:
                    print(f"⚠️ No documents found in {kb_name} collection")
                    continue

                # Try vector search
                print("  Attempting vector search...")
                pipeline = [
                    {
                        "$search": {
                            "index": f"{kb_name}_vector_index",
                            "knnBeta": {
                                "vector": query_emb.tolist(),
                                "path": "embedding",
                                "k": top_k * 2
                            }
                        }
                    },
                    {
                        "$project": {
                            "chunk_text": 1,
                            "filename": 1,
                            "created_at": 1,
                            "score": {"$meta": "searchScore"}
                        }
                    }
                ]
                
                cursor = collection.aggregate(pipeline)
                docs = await cursor.to_list(length=top_k * 2)
                print(f"  Found {len(docs)} vector matches")
                
                # If no vector results, try text search
                if not docs:
                    print("  No vector matches, trying text search...")
                    text_search = {
                        "$text": {
                            "$search": query_text,
                            "$caseSensitive": False,
                            "$diacriticSensitive": False
                        }
                    }
                    cursor = collection.find(
                        {**query_filter, **text_search},
                        {"chunk_text": 1, "filename": 1, "created_at": 1}
                    ).sort("created_at", -1).limit(top_k * 2)
                    docs = await cursor.to_list(length=top_k * 2)
                    print(f"  Found {len(docs)} text matches")
                    
            except Exception as e:
                print(f"⚠️ Search failed for {kb_name}: {str(e)}")
                # Fallback to simple find
                cursor = collection.find(
                    query_filter,
                    {"chunk_text": 1, "filename": 1, "created_at": 1}
                ).sort("created_at", -1).limit(top_k * 2)
                docs = await cursor.to_list(length=top_k * 2)

            # Process results
            for doc in docs:
                recency = await _recency_score(doc.get("created_at", datetime.utcnow()))
                score = doc.get("score", 0.5) * 0.8 + recency * 0.2
                results.append({
                    "text": doc["chunk_text"],
                    "score": float(score),
                    "source": kb_name,
                    "filename": doc.get("filename", "Unknown"),
                    "created_at": doc.get("created_at", datetime.utcnow().isoformat())
                })

        # Sort and return top results
        results.sort(key=lambda x: x["score"], reverse=True)
        top_results = results[:top_k]
        print(f"\n🏆 Top {len(top_results)} results found")
        return top_results, user_docs

    except Exception as e:
        print(f"❌ Retrieval failed: {e}")
        traceback.print_exc()
        return []