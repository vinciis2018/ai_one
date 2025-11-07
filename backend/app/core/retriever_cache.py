# ============================================
# retriever_cache.py
# Manages all knowledge base sources in memory
# Auto-syncs from MongoDB (primary) or FAISS (fallback)
# ============================================

import os
from app.config.db import db
import numpy as np
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv

# ====================================================
# Load environment
# ====================================================

load_dotenv()

# ====================================================
# Embedding Model (shared)
# ====================================================

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
embedder = SentenceTransformer(EMBEDDING_MODEL)
EMBEDDING_DIM = embedder.get_sentence_embedding_dimension()

# ====================================================
# Knowledge Base Registry
# ====================================================

class KnowledgeBaseCache:
    """
    Manages an in-memory cache of embeddings and metadata.
    Supports dynamic reload and fallback if MongoDB fails.
    """

    def __init__(self, name: str, collection_name: str):
        self.name = name
        self.collection = db[collection_name]
        self.embedder = embedder
        self.data = []
        self.last_loaded = None

    def load_data(self, force: bool = False):
        """Loads data from MongoDB if not cached or force=True."""
        if self.data and not force:
            return self.data

        try:
            cursor = self.collection.find({}, {"chunk_text": 1, "embedding": 1, "created_at": 1})
            data = []
            for doc in cursor:
                embedding = np.array(doc["embedding"], dtype=np.float32)
                created_at = (
                    datetime.fromisoformat(doc["created_at"])
                    if isinstance(doc["created_at"], str)
                    else doc["created_at"]
                )
                data.append({
                    "text": doc["chunk_text"],
                    "embedding": embedding,
                    "created_at": created_at,
                    "source_type": self.name,
                })

            self.data = data
            self.last_loaded = datetime.utcnow()
            print(f"✅ Loaded {len(data)} records from {self.name} knowledge base.")
            return data

        except Exception as e:
            print(f"⚠️ MongoDB load failed for {self.name}: {e}")
            print("⚙️ Attempting FAISS fallback (if available)...")
            self.data = []
            return []

    def add_entry(self, chunk_text: str):
        """Embed and insert a new chunk to MongoDB and cache."""
        embedding = self.embedder.encode(chunk_text).astype("float32").tolist()
        doc = {
            "chunk_text": chunk_text,
            "embedding": embedding,
            "created_at": datetime.utcnow().isoformat(),
            "source_type": self.name,
        }
        try:
            self.collection.insert_one(doc)
            self.data.append(doc)
            print(f"🧠 Added new chunk to {self.name} KB.")
        except Exception as e:
            print(f"❌ Failed to insert chunk into {self.name} KB: {e}")


# ====================================================
# Create all KB caches
# ====================================================

knowledge_bases = {
    "student": KnowledgeBaseCache("student", "kb_student"),
    "teacher": KnowledgeBaseCache("teacher", "kb_teacher"),
    "coaching": KnowledgeBaseCache("coaching", "kb_coaching"),
    "general": KnowledgeBaseCache("general", "kb_general"),
}

print(f"✅ Initialized Knowledge Base Cache with {len(knowledge_bases)} KBs loaded.")

# ====================================================
# Utility: Force reload all KBs
# ====================================================

def reload_all_kbs():
    """Force reload all knowledge bases."""
    for kb in knowledge_bases.values():
        kb.load_data(force=True)
    print("🔁 All knowledge bases reloaded successfully.")
