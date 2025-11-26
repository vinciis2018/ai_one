# ============================================
# storage.py (MongoDB setup + indexes)
# ============================================

from app.models.chunk_document import ChunkDocumentModel
from pymongo import MongoClient
import os
from datetime import datetime
import numpy as np
from dotenv import load_dotenv
from bson import ObjectId
from app.config.db import db, get_collection

load_dotenv()

# ====================================================
# Index Setup (called on startup)
# ====================================================
def setup_mongo_indexes():
    """Create all necessary indexes (vector + text)"""

    # --- 1. Knowledge Base vector indexes ---
    vector_collections = ["kb_general", "kb_coaching", "kb_student"]
    for name in vector_collections:
        col = db[name]
        try:
            # Vector index (for Atlas Vector Search or compatible)
            col.create_index(
                [("embedding", "vector")],
                name="embedding_vector_index",
                default_language="none"
            )
            print(f"✅ Vector index ensured for: {name}")
        except Exception as e:
            print(f"⚠️ Could not create vector index for {name}: {e}")

    # --- 2. Conversation text search index ---
    try:
        conv_col = db["conversations"]
        conv_col.create_index(
            [("query", "text"), ("answer", "text")],
            name="conversation_text_index",
            default_language="english"
        )
        print("✅ Text index created for 'conversations' collection.")
    except Exception as e:
        print(f"⚠️ Failed to create text index for conversations: {e}")

# ====================================================
# Store Document Embeddings
# ====================================================


def store_embeddings(chunks, embeddings, source_type="student", metadata: dict | None = None):
    """
    Stores text chunks + embeddings in MongoDB.
    Handles multiple knowledge bases, S3 URLs, and dynamic vector dimensions.
    """

    # Validate inputs
    if not chunks or not embeddings:
        raise ValueError("Chunks and embeddings cannot be empty.")

    # Ensure numpy arrays
    np_embeddings = [
        np.array(e, dtype=np.float32) if isinstance(e, list) else e.astype(np.float32)
        for e in embeddings
    ]

    print("💾 Storing embeddings in MongoDB...")

    # Choose collection dynamically
    collection_name = f"kb_{source_type}"
    col = db[collection_name]

    # Prepare MongoDB documents
    now = datetime.utcnow()
    filename = metadata.get("filename") if metadata else None

    docs = []
    for i, (chunk, emb) in enumerate(zip(chunks, np_embeddings)):
        doc_id = ObjectId()  # Generate a new ObjectId for the main document
        print(doc_id)
        doc = ChunkDocumentModel(
            _id=doc_id,
            filename=filename or f"chunk_{i}_{now.isoformat()}.txt",
            chunk_text=chunk,
            embedding=emb.tolist(),
            created_at=now
        ).dict(by_alias=True)
        docs.append(doc)
    print("docs")
    # Insert into MongoDB
    try:
        if docs:
            col.insert_many(docs)
            print(f"✅ Inserted chunked documents into '{collection_name}'.")
    except Exception as e:
        print(f"❌ MongoDB insert failed: {e}")
        return

    return docs

# ====================================================
# Load Stored Embeddings (Optional)
# ====================================================

def load_embeddings(source_type="student"):
    """
    Loads embeddings and texts from MongoDB for a given source.
    Returns (texts, np.array(embeddings))
    """
    collection_name = f"kb_{source_type}"
    collection = get_collection(collection_name)
    records = list(collection.find({}, {"_id": 0, "chunk_text": 1, "embedding": 1}))

    if not records:
        print(f"⚠️ No records found in {collection_name}.")
        return [], np.array([])

    texts = [r["chunk_text"] for r in records]
    embs = np.array([r["embedding"] for r in records], dtype=np.float32)
    return texts, embs


# ====================================================
# Load All Metadata (MongoDB)
# ====================================================

def load_all_metadata(collection_name="kb_student"):
    """
    Returns metadata (filename, source_type, created_at) for all stored documents.
    This replaces the old SQLite version.
    """
    col = db[collection_name]

    # Only fetch lightweight metadata
    docs = col.find(
        {},
        {
            "_id": 1,
            "filename": 1,
            "created_at": 1
        },
    ).sort("created_at", -1)

    return list(docs)
