# ============================================
# conversations.py
# Exposes endpoints for listing and managing conversation history
# (MongoDB version with search + pagination)
# ============================================

from fastapi import APIRouter, HTTPException, Query
from pymongo import DESCENDING
from app.config.db import get_collection
from bson import ObjectId

router = APIRouter()


# ====================================================
# List Conversations (with pagination + search)
# ====================================================

@router.get("/")
async def list_conversations(skip: int = 0, limit: int = 100, search: str = Query(None), chat_id: str = Query(None)):
    """List all saved conversations with optional search and pagination."""
    try:
        conversation_ids = []
        if chat_id:
            chats_collection = get_collection("chats")
            chat = await chats_collection.find_one({"_id": ObjectId(chat_id)})
            chat_conversations = chat["conversations"]
            conversation_ids = [ObjectId(conv["conversation_id"]) for conv in chat_conversations]


        collection = get_collection("conversations" )
        query = {}
        if search:
            query = {
                "$or": [
                    {"query": {"$regex": search, "$options": "i"}},
                    {"answer": {"$regex": search, "$options": "i"}},
                ]
            }
        if conversation_ids:
            query["_id"] = {"$in": conversation_ids}

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
# List Chats (with pagination + search)
# ====================================================

@router.get("/chats")
async def list_chats(skip: int = 0, limit: int = 20, search: str = Query(None), user_id: str = Query(None)):
    """List all saved chats with optional search and pagination."""
    try:

        collection = get_collection("chats" )
        query = {}
        if search:
            query = {
                "$or": [
                    {"title": {"$regex": search, "$options": "i"}},
                ]
            }
        # Add user_id search for both user_id and teacher_id fields
        if user_id:
            query["$or"] = query.get("$or", []) + [
                {"user_id": user_id},
                # {"teacher_id": user_id}
            ]
        cursor = (
            collection.find(query)
            .sort("created_at", DESCENDING)
            .skip(skip)
            .limit(limit)
        )

        cursor = await cursor.to_list()

        chats = []
        for doc in cursor:
            chats.append({
                "id": str(doc.get("_id")),
                "title": doc.get("title", ""),
                "conversations": doc.get("conversations", []),
                "created_at": doc.get("created_at", None)
            })

        return {"chats": chats, "count": len(chats)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chats: {str(e)}")



# ====================================================
# List Chats (with pagination + search)
# ====================================================

@router.get("/chats/teacher/student")
async def list_teacher_student_chats(
    skip: int = 0,
    limit: int = 20,
    search: str = Query(None),
    user_id: str = Query(None),
    student_id: str = Query(None),
    teacher_id: str = Query(None)
    ):
    """List all saved chats with optional search and pagination."""
    try:

        collection = get_collection("chats" )
        query = {}
        if search:
            query = {
                "$or": [
                    {"title": {"$regex": search, "$options": "i"}},
                ]
            }
        # Add user_id search for both user_id and teacher_id fields
        if teacher_id and student_id:
            query["$and"] = query.get("$and", []) + [
                {"teacher_id": teacher_id},
                {"student_id": student_id}
            ]
        cursor = (
            collection.find(query)
            .sort("created_at", DESCENDING)
            .skip(skip)
            .limit(limit)
        )

        cursor = await cursor.to_list()

        chats = []
        for doc in cursor:
            chats.append({
                "id": str(doc.get("_id")),
                "title": doc.get("title", ""),
                "conversations": doc.get("conversations", []),
                "created_at": doc.get("created_at", None)
            })

        return {"chats": chats, "count": len(chats)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chats: {str(e)}")




# ====================================================
# Get Single Chat
# ====================================================

@router.get("/chat/{chat_id}")
async def get_conversation(chat_id: str):
    """Fetch a specific conversation by ID."""
    try:
        collection = get_collection("chats")
        chat = await collection.find_one({"_id": ObjectId(chat_id)})
        conversations = []
        for doc in chat["conversations"]:
            conversation = await get_collection("conversations").find_one({"_id": ObjectId(doc["conversation_id"])})
            conversations.append({
                "id": str(conversation["_id"]),
                "query_by": conversation["query_by"],
                "answer_by": conversation["answer_by"],
                "query": conversation["query"],
                "answer": conversation["answer"],
                "sources_used": conversation["sources_used"],
                "prev_conversation": doc["prev_conversation"],
                # "parent_chat": doc["parent_chat"],
                "created_at": conversation["created_at"],
                "user_id": conversation["user_id"],
                "attached_media": conversation.get("attached_media", None),
                "media_transcript": conversation.get("media_transcript", None),
                "score": conversation.get("score", 1)
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
# Get Chat by Space
# ====================================================

@router.get("/chat/space/get")
async def get_chat_by_space(
    user_id: str = Query(..., description="User ID"),
    chat_space: str = Query(..., description="Chat Space identifier")
):
    """Fetch a specific conversation by chat_space and user_id."""
    try:
        collection = get_collection("chats")
        # Find the most recent chat for this space and user
        chat = await collection.find_one(
            {"user_id": user_id, "chat_space": chat_space},
            sort=[("updated_at", DESCENDING)]
        )

        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found for this space")

        conversations = []
        for doc in chat.get("conversations", []):
            conversation = await get_collection("conversations").find_one({"_id": ObjectId(doc["conversation_id"])})
            if conversation:
                conversations.append({
                    "id": str(conversation["_id"]),
                    "query_by": conversation.get("query_by"),
                    "answer_by": conversation.get("answer_by"),
                    "query": conversation.get("query"),
                    "answer": conversation.get("answer"),
                    "sources_used": conversation.get("sources_used"),
                    "prev_conversation": doc.get("prev_conversation"),
                    "created_at": conversation.get("created_at"),
                    "user_id": conversation.get("user_id"),
                    "attached_media": conversation.get("attached_media", None),
                    "media_transcript": conversation.get("media_transcript", None),
                    "score": conversation.get("score", 1)
                })

        return {
            "id": str(chat["_id"]),
            "title": chat.get("title", ""),
            "user_id": chat["user_id"],
            "conversations": conversations,
            "created_at": chat["created_at"]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation: {str(e)}")


# ====================================================
# Get Single Conversation
# ====================================================

@router.get("/{conversation_id}")
def get_conversation(conversation_id: str):
    """Fetch a specific conversation by ID."""
    try:
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
        collection = get_collection("conversations")
        result = collection.delete_one({"_id": ObjectId(conversation_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Conversation not found")

        return {"status": "deleted", "id": conversation_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting conversation: {str(e)}")

@router.get("/update/relevance/score")
async def update_relevance_score(
    conversation_id: str = Query(..., description="Conversation id to update"),
    score: int = Query(..., description="Relevance score between 0 and 1")
):
    """Update relevance score of a conversation."""
    try:
        print("conv: ", conversation_id, "////// score: ", score)
        collection = get_collection("conversations")
        result = await collection.update_one({"_id": ObjectId(conversation_id)}, {"$set": {"score": score}})
        print(result)
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Conversation not found")

        return {"status": "updated", "conversation_id": conversation_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating relevance score: {str(e)}")
