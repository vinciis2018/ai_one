# ============================================
# conversations.py
# Exposes endpoints for listing and managing conversation history
# (MongoDB version with search + pagination)
# ============================================

from fastapi import APIRouter, HTTPException, Query
from pymongo import DESCENDING
from app.config.db import get_collection

router = APIRouter()


# ====================================================
# List Conversations (with pagination + search)
# ====================================================

@router.get("/")
async def list_conversations(skip: int = 0, limit: int = 20, search: str = Query(None)):
    """List all saved conversations with optional search and pagination."""
    try:
        collection = get_collection("conversations" )

        query = {}
        if search:
            query = {
                "$or": [
                    {"query": {"$regex": search, "$options": "i"}},
                    {"answer": {"$regex": search, "$options": "i"}}
                ]
            }

        cursor = (
            collection.find(query)
            .sort("created_at", DESCENDING)
            .skip(skip)
            .limit(limit)
        )

        cursor = await cursor.to_list()

        conversations = []
        for doc in cursor:
            conversations.append({
                "id": str(doc.get("_id")),
                "query": doc.get("query", ""),
                "answer": doc.get("answer", ""),
                "created_at": doc.get("created_at", None)
            })

        return {"conversations": conversations, "count": len(conversations)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching conversations: {str(e)}")



# ====================================================
# Get Single Chat
# ====================================================

@router.get("/chat/{chat_id}")
async def get_conversation(chat_id: str):
    """Fetch a specific conversation by ID."""
    try:
        from bson import ObjectId
        collection = get_collection("chats")
        chat = await collection.find_one({"_id": ObjectId(chat_id)})
        print(chat)
        conversations = []
        for doc in chat["conversations"]:
            conversation = await get_collection("conversations").find_one({"_id": ObjectId(doc["conversation_id"])})
            conversations.append({
                "id": str(conversation["_id"]),
                "query_by": conversation["query_by"],
                "answer_by": conversation["answer_by"],
                "query": conversation["query"],
                "answer": conversation["answer"],
                "prev_conversation": doc["prev_conversation"],
                "parent_conversation": doc["parent_conversation"],
                "created_at": conversation["created_at"]
            })

        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")

        return {
            "id": str(chat["_id"]),
            "title": chat["title"],
            "user_id": chat["user_id"],
            "conversations": conversations,
            "created_at": chat["created_at"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation: {str(e)}")


# ====================================================
# Get Single Conversation
# ====================================================

@router.get("/{conversation_id}")
def get_conversation(conversation_id: str):
    """Fetch a specific conversation by ID."""
    try:
        from bson import ObjectId
        collection = get_collection("conversations")
        conv = collection.find_one({"_id": ObjectId(conversation_id)})

        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")

        return {
            "id": str(conv["_id"]),
            "query": conv.get("query", ""),
            "answer": conv.get("answer", ""),
            "created_at": conv.get("created_at", None)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation: {str(e)}")


# ====================================================
# Delete Conversation
# ====================================================

@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: str):
    """Delete a conversation by ID."""
    try:
        from bson import ObjectId
        collection = _get_collection()
        result = collection.delete_one({"_id": ObjectId(conversation_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Conversation not found")

        return {"status": "deleted", "id": conversation_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting conversation: {str(e)}")
