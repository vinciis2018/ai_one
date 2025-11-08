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
from bson import ObjectId
from app.core.retriever import retrieve_similar
from app.core.logger_middleware import log_query_event
from app.core.llm_manager import call_llm
from app.config.db import db, get_collection
from app.config.settings import BASE_DIR
from typing import Optional
from app.core.conversation_memory import retrieve_from_conversation_memory

# ====================================================
# Load config and environment
# ====================================================

load_dotenv()

CONFIG_FILE = BASE_DIR / "config.yaml"
with open(CONFIG_FILE, "r") as f:
    CONFIG = yaml.safe_load(f)

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
    teacherId: Optional[str] = None
    chatId: str
    previousConversation: str
    domain_expertise: str

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
        chat_id = req.chatId or None
        previous_conversation = req.previousConversation or None
        user_id = req.userId or None
        teacher_id = req.teacherId or None
        domain_expertise = req.domain_expertise or None
        if not user_query:
            raise HTTPException(status_code=400, detail="Query text cannot be empty.")
        
        user_ids = [user_id]
        if teacher_id:
            teacher_user_id = db["teachers"].find_one({"_id": ObjectId(teacher_id)})["user_id"]
            user_ids.append(teacher_user_id)


        # Step 1: Retrieve from knowledge bases
        context_chunks, user_docs = await retrieve_similar(user_query, user_ids)

        # Step 2: Retrieve from user’s conversation history
        memory_chunks = await retrieve_from_conversation_memory(user_id, user_query, top_k=3)

        # Combine results
        all_contexts = context_chunks + memory_chunks

        # Convert any ObjectIds in user_docs to strings
        user_docs = _sanitize_sources(user_docs)
        
        if not all_contexts:
            print("⚠️ No relevant chunks found. Returning fallback.")
            augmented_prompt = (
                f"Please respond politely to upload relevant docs for reference as no relevant notes found. Respond from general information\n\n"
                # f"Context:\n{context_text}\n\n"
                f"Question: {user_query}"
            )

            answer = call_llm(augmented_prompt, domain_expertise)
            log_query_event(user_query, answer, success=False)
            res = await _save_conversation(user_query, answer, chat_id, previous_conversation, user_id, teacher_id)
        
            return {
                "chat_id": res["chat_id"],
                "conversation_id": res["conversation_id"],
                "previous_conversation": str(previous_conversation) if previous_conversation else None,
                "query": user_query,
                "answer": answer,
                "sources_used": len(user_docs), 
                "sources": user_docs
            }

        # Step 2: Build augmented prompt
        # Extract text from each chunk and join them

        doc_context = "\n\n".join(f"📘 {chunk['source'].capitalize()} Context:\n{chunk['text']}" 
                          for chunk in context_chunks)
        conversation_context = "\n\n".join(f"💬 Past Conversation ({chunk['created_at']}):\n{chunk['text']}" 
                                        for chunk in memory_chunks)

        context_text = f"{doc_context}\n\n{conversation_context}"

        # context_text = "\n\n".join(chunk['text'] for chunk in all_contexts)

        augmented_prompt = f"""
            Use the following **knowledge and previous conversation history** to answer clearly.\n\n"
            
            If part of the answer relates to something we discussed earlier, mention it naturally 
            (e.g., "As we talked about before..." or "Building on your earlier question about...").\n\n

            Context:\n{context_text}\n\n
            Question: {user_query}
        """

        # Step 3: Get answer (OpenAI or local fallback)
        answer = call_llm(augmented_prompt, domain_expertise)

        # Step 4: Log + save
        log_query_event(user_query, answer)
        res = await _save_conversation(user_query, answer, chat_id, previous_conversation, user_id, teacher_id, user_docs)
        
        return {
            "chat_id": res["chat_id"],
            "conversation_id": res["conversation_id"],
            "previous_conversation": str(previous_conversation) if previous_conversation else None,
            "query": user_query, 
            "answer": answer, 
            "sources_used": len(user_docs), 
            "sources": user_docs
        }

    except Exception as e:
            print(f"Error processing query: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error processing your request: {str(e)}"
            )


# ====================================================
# Helper: Sanitize sources to remove ObjectIds
# ====================================================
def _sanitize_sources(sources):
    """
    Recursively convert ObjectId instances to strings in the sources list.
    """
    if isinstance(sources, list):
        return [_sanitize_sources(item) for item in sources]
    elif isinstance(sources, dict):
        return {k: _sanitize_sources(v) for k, v in sources.items()}
    elif isinstance(sources, ObjectId):
        return str(sources)
    elif isinstance(sources, datetime):
        return sources.isoformat() + "Z"
    else:
        return sources

# ====================================================
# Helper: Save conversation to MongoDB
# ====================================================
async def _save_conversation(
    query: str,
    answer: str,
    chat_id: Optional[str] = None,
    previous_conversation: Optional[str] = None,
    user_id: Optional[str] = None,
    teacher_id: Optional[str] = None,
    user_docs: Optional[list] = None
) -> dict:
    """
    Save or update chat and conversation in MongoDB.
    - If chat_id is provided, adds the new conversation to the existing chat
    - If no chat_id, creates a new chat with the conversation
    Returns only the essential IDs, not the full documents.
    """
    try:
        chat_collection = get_collection("chats")
        conversation_collection = get_collection("conversations")
        
        # Create conversation document
        now = datetime.utcnow()
        conversation = {
            "query": query,
            "answer": answer,
            "query_by": "user",
            "answer_by": "assistant",
            "prev_conversation": previous_conversation,
            "sources_used": [str(doc['_id']) for doc in user_docs],
            "created_at": now,
            "updated_at": now,
            "edit_history": []
        }
        
        # Insert conversation
        conversation_result = await conversation_collection.insert_one(conversation.copy())
        conversation_id = str(conversation_result.inserted_id)
        
        if chat_id:
            # For existing chat, just add the new conversation reference
            chat_id_obj = ObjectId(chat_id)
            
            # Check if this conversation already exists in the chat
            existing_conv = await chat_collection.find_one({
                "_id": chat_id_obj,
                "conversations.conversation_id": conversation_id
            })
            
            if not existing_conv:
                # Only add the conversation if it doesn't already exist
                pseudo_conversation = {
                    "conversation_id": conversation_id,
                    "prev_conversation": previous_conversation,
                    "parent_conversation": chat_id,
                    "created_at": now,
                    "updated_at": now
                }
                
                await chat_collection.update_one(
                    {"_id": chat_id_obj},
                    {
                        "$push": {"conversations": pseudo_conversation},
                        "$set": {
                            "updated_at": now,
                            # "title": query[:100]  # Update title with latest query (truncated)
                        }
                    }
                )
        else:
            # Create new chat with the conversation
            if not user_id:
                raise ValueError("user_id is required when creating a new chat")
                
            chat_doc = {
                "title": query[:100],
                "user_id": user_id,
                "teacher_id": teacher_id,
                "conversations": [{
                    "conversation_id": conversation_id,
                    "prev_conversation": previous_conversation,
                    "parent_conversation": None,  # Will be updated after insert
                    "created_at": now,
                    "updated_at": now
                }],
                "created_at": now,
                "updated_at": now
            }
            
            # Insert new chat
            result = await chat_collection.insert_one(chat_doc)
            chat_id = str(result.inserted_id)
            
            # Update the parent_conversation reference
            await chat_collection.update_one(
                {"_id": result.inserted_id, "conversations.conversation_id": conversation_id},
                {"$set": {"conversations.$.parent_conversation": chat_id}}
            )

        
        from sentence_transformers import SentenceTransformer
        embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

        embedding = embedder.encode(f"{query} {answer}").astype("float32").tolist()
        await conversation_collection.update_one(
            {"_id": conversation_result.inserted_id},
            {"$set": {"embedding": embedding, "user_id": user_id}}
        )
        
        return {
            "chat_id": chat_id,
            "conversation_id": conversation_id
        }
        
    except Exception as e:
        print(f"⚠️ Failed to save conversation: {e}")
        raise



