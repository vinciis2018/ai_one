# In app/routers/status.py
from fastapi import APIRouter, Depends
from pymongo import MongoClient
from app.config.db import get_db
from datetime import datetime

router = APIRouter()

@router.get("/status")
async def get_status():
    """Get system status and statistics."""
    try:
        db = get_db()
        
        # Get document counts from all collections
        collections = {
            "documents": db.documents.count_documents({}),
            "kb_student": db.kb_student.count_documents({}),
            "kb_coaching": db.kb_coaching.count_documents({}),
            "kb_general": db.kb_general.count_documents({}),
            "conversations": db.conversations.count_documents({}),
        }
        
        # Get latest document timestamp
        latest_doc = db.documents.find_one(
            {},
            sort=[("created_at", -1)],
            projection={"created_at": 1}
        )
        
        return {
            "status": "ok",
            "timestamp": datetime.utcnow().isoformat(),
            "collections": collections,
            "last_updated": latest_doc.get("created_at").isoformat() if latest_doc else None
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    try:
        # Test database connection
        db = get_db()
        db.command('ping')
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat(),
            "database": "disconnected"
        }