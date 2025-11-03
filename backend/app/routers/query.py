# ============================================
# query.py
# Main RAG endpoint – combines retriever + LLM + logging
# (MongoDB integrated for persistence)
# ============================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import yaml
from dotenv import load_dotenv
from datetime import datetime

from app.core.retriever import retrieve_similar
from app.core.logger_middleware import log_query_event
from app.core.llm_manager import call_llm
from app.config.db import db, get_collection
from app.config.settings import BASE_DIR

# ====================================================
# Load config and environment
# ====================================================

load_dotenv()

CONFIG_FILE = BASE_DIR / "config.yaml"
with open(CONFIG_FILE, "r") as f:
    CONFIG = yaml.safe_load(f)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = CONFIG["model"]["name"]
TEMP = CONFIG["model"]["temperature"]
MAX_TOKENS = CONFIG["model"]["max_tokens"]
FALLBACK_ANSWER = CONFIG["fallback"]["offline_response"]

router = APIRouter()

# ====================================================
# Request Schema
# ====================================================

class QueryRequest(BaseModel):
    text: str
    userId: str

# ====================================================
# Main RAG Query Endpoint
# ====================================================

@router.post("/")
async def query(req: QueryRequest):
    """
    Main endpoint for querying the AI assistant.
    Retrieves context from uploaded docs and generates response.
    """
    try:
        user_query = req.text.strip()

        if not user_query:
            raise HTTPException(status_code=400, detail="Query text cannot be empty.")
        print("user_query", req.userId)

        # Step 1: Retrieve relevant chunks
        context_chunks, user_docs = await retrieve_similar(user_query, req.userId)
        if not context_chunks:
            print("⚠️ No relevant chunks found. Returning fallback.")
            answer = "No relevant notes found. Please switch to global search or upload your notes first."
            log_query_event(user_query, answer, success=False)
            _save_conversation(user_query, answer)
            return {"query": user_query, "answer": answer}
        print("context_chunks", context_chunks)

        # Step 2: Build augmented prompt
        # # join text from each chunk and join them
        # context_text = "\n\n".join(context_chunks)

        # Extract text from each chunk and join them
        context_text = "\n\n".join(chunk['text'] for chunk in context_chunks)
        print("context_chunks", context_text)

        augmented_prompt = (
            f"Answer the following question using ONLY the context below.\n\n"
            f"Context:\n{context_text}\n\n"
            f"Question: {user_query}"
        )
        print("augmented_prompt", augmented_prompt)

        # Step 3: Get answer (OpenAI or local fallback)
        answer = call_llm(augmented_prompt)
        print("answer", answer)

        # Step 4: Log + save
        log_query_event(user_query, answer)
        _save_conversation(user_query, answer)

        return {"query": user_query, "answer": answer, "sources_used": len(user_docs), "sources": user_docs}

    except Exception as e:
            print(f"Error processing query: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error processing your request: {str(e)}"
            )


# ====================================================
# Helper: Save conversation to MongoDB
# ====================================================

def _save_conversation(query: str, answer: str):
    """Persist conversation to MongoDB."""
    try:
        collection = get_collection("conversations")
        conversation = {
            "query": query,
            "answer": answer,
            "created_at": datetime.utcnow(),
        }
        collection.insert_one(conversation)
        print(f"💾 Conversation saved to MongoDB ({collection.name})")
    except Exception as e:
        print(f"⚠️ Failed to log conversation to MongoDB: {e}")

