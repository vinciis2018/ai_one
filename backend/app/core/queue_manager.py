from datetime import datetime
from app.config.db import get_collection
from bson import ObjectId

async def add_task_to_queue(task_type: str, payload: dict) -> str:
    """
    Adds a task to the task_queue collection.
    Returns the stringified queue_id.
    """
    col = get_collection("task_queue")
    
    task = {
        "type": task_type,
        "payload": payload,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await col.insert_one(task)
    return str(result.inserted_id)
