from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.schemas import PyObjectId
from bson import ObjectId

class QuickAction(BaseModel):
    micro_quiz: Optional[List[Dict[str, Any]]] = None
    follow_on_concept: Optional[str] = None

class StudentKnowledgeGraph(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    student_id: str
    concept_node_id: Optional[str] = None # ID from syllabus tree if available, or just the concept path
    
    # Hierarchical classification
    subject: str
    domain: str
    chapter: Optional[str] = None
    topic: Optional[str] = None
    micro_concept: Optional[str] = None
    
    interaction_type: str # "Conceptual Doubt", "Numerical Problem", "Strategy Question", "Casual"
    quick_action: Optional[QuickAction] = None
    chat_id: Optional[str] = None
    conversation_id: Optional[str] = None
    
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    confidence_score: float = 0.0 # Confidence of the classification
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "student_id": "student123",
                "subject": "Physics",
                "chapter": "Rotation",
                "topic": "Torque",
                "micro_concept": "Definition",
                "interaction_type": "Conceptual Doubt",
                "timestamp": "2025-11-01T12:00:00Z"
            }
        }
    )
