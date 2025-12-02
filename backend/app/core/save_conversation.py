# ============================================
# query.py
# Main RAG endpoint – combines retriever + LLM + logging
# (MongoDB integrated for persistence)
# ============================================


from app.core.retriever_cache import embedder
from datetime import datetime
from bson import ObjectId
from app.config.db import db, get_collection
from typing import Optional, List, Dict, Any

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
    student_id: Optional[str] = None,
    user_docs: Optional[list] = None,
    attached_media: Optional[str] = None,
    media_transcript: Optional[str] = None,
    user_text: Optional[str] = None,
    chat_space: Optional[str] = None,
    domain: Optional[str] = None
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
            "query": user_text if user_text else query,
            "answer": answer,
            "query_by": "user",
            "answer_by": "assistant",
            "prev_conversation": previous_conversation,
            "parent_chat": chat_id,
            "sources_used": [str(doc["_id"]) if "_id" in doc else str(doc["conversation_id"]) for doc in user_docs],
            "created_at": now,
            "updated_at": now,
            "edit_history": [],
            "attached_media": attached_media,
            "media_transcript": media_transcript,
            "domain": domain,

        }
        

        # Insert conversation
        conversation_result = await conversation_collection.insert_one(conversation.copy())
        conversation_id = str(conversation_result.inserted_id)
        
        # If no chat_id provided, try to find existing chat by chat_space
        if not chat_id and chat_space and user_id:
            # Build query to find exact match for context
            chat_query = {
                "chat_space": chat_space
            }
            
            # If specific teacher or student context is provided, ensure we match that
            if teacher_id == user_id:
                chat_query["teacher_id"] = user_id
            if student_id == user_id:
                chat_query["student_id"] = user_id
                
            existing_chat = await chat_collection.find_one(chat_query)
            
            if existing_chat:
                chat_id = str(existing_chat["_id"])

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
                    "parent_chat": chat_id,
                    "created_at": now,
                    "updated_at": now
                }
                
                await chat_collection.update_one(
                    {"_id": chat_id_obj},
                    {
                        "$push": {
                            "conversations": pseudo_conversation,
                        },
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
                "student_id": student_id,
                "chat_space": chat_space,
                "conversations": [{
                    "conversation_id": conversation_id,
                    "prev_conversation": previous_conversation,
                    "parent_chat": None,  # Will be updated after insert
                    "created_at": now,
                    "updated_at": now
                }],
                "created_at": now,
                "updated_at": now
            }
            
            # Insert new chat
            result = await chat_collection.insert_one(chat_doc)
            chat_id = str(result.inserted_id)

            
            # Update the parent_chat reference
            await chat_collection.update_one(
                {"_id": result.inserted_id, "conversations.conversation_id": conversation_id},
                {"$set": {
                    "conversations.$.parent_chat": chat_id,
                    

                }}
            )

            # update chat_id in conversation
            await conversation_collection.update_one(
                {"_id": conversation_id},
                {"$set": {"parent_chat": chat_id}}
            )

        
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

