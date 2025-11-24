from fastapi import APIRouter, HTTPException, Body
from app.config.db import get_collection
from bson import ObjectId
from typing import Dict, Any

router = APIRouter()

@router.post("/response")
async def save_quick_action_response(
    payload: Dict[str, Any] = Body(...)
):
    """
    Save the student's response to a quick action (micro-quiz).
    Payload should contain:
    - chat_id: str
    - conversation_id: str
    - response: Dict[str, Any] (The user's answer)
    """
    try:
        conversation_id = payload.get("conversation_id")
        response = payload.get("quick_action")

        if not conversation_id or not response:
            raise HTTPException(status_code=400, detail="Missing required fields: conversation_id, response")

        collection = get_collection("student_knowledge_graph")
        
        # Find the entry and update it
        result = await collection.update_one(
            {
                "conversation_id": conversation_id
            },
            {
                "$set": {"quick_action": response}
            }
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Knowledge graph entry not found")

        return {"status": "success", "message": "Response saved successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving response: {str(e)}")
