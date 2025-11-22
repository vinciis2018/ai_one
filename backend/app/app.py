import os
import numpy as np
from datetime import datetime
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://vinciis2018:212Matpu6na@clusterai.0fzws.mongodb.net/")
# MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

MONGO_DB = os.getenv("MONGO_DB", "professor")

# ============================
# CONFIG
# ============================

COLLECTION = "kb_teacher"       # choose any KB collection
INDEX_NAME = "vector_index"

TEST_TEXT_1 = "What is pressure?"
TEST_TEXT_2 = "What is the dimensions of pressure?"

# ============================
# CONNECT
# ============================

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db[COLLECTION]

print("\n============================")
print("🔍 RAG VECTOR DIAGNOSTICS")
print("============================\n")

# ============================
# 1. Load Embedding Model
# ============================

print("📌 Loading embedding model...")
model_name = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
embedder = SentenceTransformer(model_name)

dim = embedder.get_sentence_embedding_dimension()
print(f"   → Model: {model_name}")
print(f"   → Embedding dimension: {dim}")

# ============================
# 2. Test Embedding Generation
# ============================

print("\n📌 Generating test embeddings...")

emb1 = embedder.encode(TEST_TEXT_1).astype("float32")
emb2 = embedder.encode(TEST_TEXT_2).astype("float32")

print("   → emb1 shape:", emb1.shape)
print("   → emb2 shape:", emb2.shape)

# Cosine similarity check
cos_sim = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
print(f"   → Cosine similarity (should be > 0.5): {cos_sim:.4f}")

# ============================
# 3. Check data schema
# ============================

print("\n📌 Checking stored embeddings...")

doc = collection.find_one({}, {"embedding": 1, "chunk_text": 1})

if not doc:
    print("❌ No documents found in collection. Cannot test vector search.")
    exit()

stored_emb = np.array(doc["embedding"], dtype="float32")

print("   → Chunk text:", doc.get("chunk_text", "")[:60], "...")
print("   → Stored embedding shape:", stored_emb.shape)
print("   → Stored embedding dtype:", stored_emb.dtype)

if stored_emb.shape[0] != dim:
    print(f"❌ ERROR: Stored embedding dimension {stored_emb.shape[0]} != model dim {dim}")
else:
    print("✅ Stored embedding dimension OK")

# ============================
# 4. Manual Similarity Check vs DB
# ============================

manual_sim = np.dot(emb1, stored_emb) / (
    np.linalg.norm(emb1) * np.linalg.norm(stored_emb)
)

print(f"   → Manual similarity with sample DB chunk: {manual_sim:.4f}")

# ============================
# 5. Test Vector Search Pipeline
# ============================

print("\n📌 Testing MongoDB Atlas vector search...")

pipeline = [
    {
        "$vectorSearch": {
            "queryVector": emb1.tolist(),
            "path": "embedding",
            "numCandidates": 100,
            "limit": 5,
            "index": INDEX_NAME
        }
    },
    {
        "$project": {
            "_id": 1,
            "chunk_text": 1,
            "score": { "$meta": "vectorSearchScore" }
        }
    }

]

try:
    results = list(collection.aggregate(pipeline))
    print(f"   → Vector search returned {len(results)} results")

    if len(results) == 0:
        print("❌ Vector search returned 0 results.")
        print("🔍 Possible causes:")
        print("   - Wrong index path")
        print("   - Wrong embedding dimensions")
        print("   - dtype mismatch (float64 instead of float32)")
        print("   - Empty index or wrong collection")
    else:
        for r in results[:3]:
            print("\n   ✔ Chunk:", r["chunk_text"][:80])
            print("     Score:", r["score"])

except Exception as e:
    print(f"❌ Vector search error: {e}")

# ============================
# DONE
# ============================

print("\n============================")
print("✔ RAG VECTOR DIAGNOSTICS COMPLETE")
print("============================\n")
