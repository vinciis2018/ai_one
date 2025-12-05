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

def _recency_score(created_at: datetime) -> float:
    """Compute recency bonus (0–1). Newer chunks rank higher."""
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
    age_days = (datetime.utcnow() - created_at).days
    return max(0, 1 - (age_days / 365))

async def retrieve_similar(
    query_text: str,
    user_ids: List[str] = None,
    top_k: int = 5,
    kbs: List[str] = ["student", "teacher", "coaching", "general"]
) -> List[Dict[str, Any]]:
    """
    Retrieve top-K document chunks relevant to the query from all KBs.
    Args:
        query_text: The search query
        user_ids: Optional list of user IDs for filtering
        top_k: Number of results to return
    Returns:
        List of dictionaries containing document chunks and metadata
    """
    try:
        print(f"🔍 Starting search for: '{query_text}'")
        model_dim = embedder.get_sentence_embedding_dimension()
        print("MODEL DIMENSIONS: ", model_dim)

        query_emb = embedder.encode(query_text).astype("float32")
        print("QUERY EMBEDDING: ", query_emb.shape)
        results = []
        # Get user's document IDs if user_id is provided
        user_doc_ids = []

        document_collection = get_collection("documents")
        user_documents = document_collection.find({"user_id": {"$in": user_ids}})
        user_docs = await user_documents.to_list(length=100)  # Adjust limit as needed

        # get kb_ids from all the user_docs chunk_docs_ids
        kb_ids = []
        for doc in user_docs:
            if "chunk_docs_ids" in doc:
                kb_ids.extend(doc["chunk_docs_ids"])
    
        # Extract all chunk document IDs
        for doc in user_docs:
            if "chunk_docs_ids" in doc:
                user_doc_ids.extend(doc["chunk_docs_ids"])
        
        print(f"🔑 Found {len(user_doc_ids)} document chunks for {len(user_ids)} users")

        # Search across all knowledge bases
        for kb_name in kbs:
            print(f"\n🔎 Searching in {kb_name} collection...")
            kb_collection = get_collection(f"kb_{kb_name}")
            
            # Try without user filter first
            query_filter = {}
            if user_doc_ids:  # Only filter by user's documents if we have any
                query_filter["_id"] = {"$in": user_doc_ids}
            
            try:
                # First, check if collection has any documents
                count = await kb_collection.count_documents({"_id": {"$in": kb_ids}})
                print(f"  Total documents in collection: {count}")
                
                if count == 0:
                    print(f"⚠️ No documents found in {kb_name} collection")
                    continue

                # Try vector search
                print("  Attempting vector search...")
                pipeline = [
                    {
                        "$vectorSearch": {
                            "index": "vector_index",
                            "queryVector": query_emb.tolist(),
                            "path": "embedding",
                            "numCandidates": top_k * 20,   # recommended ratio
                            "limit": top_k * 2
                        }
                    },
                    {
                        "$match": {
                            "_id": {"$in": kb_ids}
                        }
                    },
                    {
                        "$project": {
                            "_id": 1,
                            "chunk_text": 1,
                            "filename": 1,
                            "created_at": 1,
                            "score": {"$meta": "vectorSearchScore"},
                        }
                    }
                ]
                                
                cursor = kb_collection.aggregate(pipeline)
                docs = await cursor.to_list(length=top_k * 2)
                print(f"Found {len(docs)} vector matches \n VECTOR SEARCH RAW OUTPUT:")

                for d in docs:
                    # higher score means more useful chunk, index it according to the score, if it improves accuracy
                    # implement mechanism to remove chunks with lower scores like 0.1 and lower
                    print("   →", d.get("chunk_text", "")[:100], "\n   || score:", d.get("score"), "\n")
                
                # If no vector results, try text search
                if not docs:
                    print("No vector matches, trying text search...")

                    cursor = kb_collection.find(
                        {
                            "_id": {"$in": kb_ids},
                            "$text": {
                                "$search": query_text,
                                "$caseSensitive": False,
                                "$diacriticSensitive": False
                            }
                        },
                        {"chunk_text": 1, "filename": 1, "created_at": 1}
                    ).sort("created_at", -1).limit(top_k * 2)
                    docs = await cursor.to_list(length=top_k * 2)
                    print(f"  Found {len(docs)} text matches")
                    
            except Exception as e:
                print(f"⚠️ Search failed for {kb_name}: {str(e)}")
                print(f"🔄 Falling back to local vector search for {kb_name}...")
                
                # Fallback: Local Vector Search using NumPy
                try:
                    # Fetch candidate documents with embeddings
                    cursor = kb_collection.find(
                        {
                            "_id": {"$in": kb_ids},
                            **query_filter
                        },
                        {"chunk_text": 1, "filename": 1, "created_at": 1, "embedding": 1}
                    )
                    candidate_docs = await cursor.to_list(length=None) # Fetch all candidates
                    
                    if not candidate_docs:
                        print(f"  No candidate documents found for local search in {kb_name}")
                        docs = []
                    else:
                        # Extract embeddings and compute cosine similarity
                        doc_embeddings = [d.get("embedding") for d in candidate_docs if d.get("embedding")]
                        valid_docs = [d for d in candidate_docs if d.get("embedding")]
                        
                        if not doc_embeddings:
                            print("  No embeddings found in candidate documents.")
                            docs = []
                        else:
                            doc_embeddings_np = np.array(doc_embeddings)
                            
                            # Normalize embeddings for cosine similarity
                            norm_doc = np.linalg.norm(doc_embeddings_np, axis=1)
                            norm_query = np.linalg.norm(query_emb)
                            
                            # Avoid division by zero
                            norm_doc[norm_doc == 0] = 1e-10
                            if norm_query == 0:
                                norm_query = 1e-10
                                
                            # Compute cosine similarity
                            # query_emb is (dim,), doc_embeddings_np is (n, dim)
                            dot_products = np.dot(doc_embeddings_np, query_emb)
                            similarities = dot_products / (norm_doc * norm_query)
                            
                            # Attach scores to documents
                            for i, doc in enumerate(valid_docs):
                                doc["score"] = float(similarities[i])
                                
                            # Sort by score descending
                            valid_docs.sort(key=lambda x: x["score"], reverse=True)
                            
                            # Take top K * 2
                            docs = valid_docs[:top_k * 2]
                            print(f"  Found {len(docs)} local vector matches")
                            
                except Exception as local_e:
                    print(f"❌ Local fallback failed: {local_e}")
                    traceback.print_exc()
                    docs = []

            # Process results
            for doc in docs:
                recency = _recency_score(doc.get("created_at", datetime.utcnow()))
                score = doc.get("score", 0.5) * 0.8 + recency * 0.2
                results.append({
                    "text": doc["chunk_text"],
                    "score": float(score),
                    "source": kb_name,
                    "filename": doc.get("filename", "Unknown"),
                    "source_id": str(doc["_id"]),
                    "document_type": "knowledge_base",
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


