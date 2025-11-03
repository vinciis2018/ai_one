from app.models.schemas import PyObjectId
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from bson import ObjectId
from datetime import datetime
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class MessageModel(BaseModel):
    role: MessageRole
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ConversationModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    query: Optional[str] = None
    answer: Optional[str] = None
    query_by: Optional[str] = None
    answer_by: Optional[str] = None
    prev_conversation: Optional[str] = None
    parent_conversation: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    edit_history: Optional[List[Dict[str, Any]]] = None

    model_config = ConfigDict(
        json_encoders={ObjectId: str},
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "query": "What is Newton's second law?",
                "answer": "Newton's second law states that force equals mass times acceleration (F=ma).",
                "query_by": "user",
                "answer_by": "assistant",
                "created_at": "2025-11-01T12:00:00Z",
                "updated_at": "2025-11-01T12:05:00Z",
                "edit_history": [
                    {
                        "timestamp": "2025-11-01T12:05:00Z",
                        "content": "Newton's second law states that force equals mass times acceleration (F=ma)."
                    }
                ]
            }
        }
    )

class PseudoConversationModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    prev_conversation: Optional[str] = None
    parent_conversation: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        json_encoders={ObjectId: str},
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "prev_conversation": "conversation123",
                "parent_conversation": "conversation123",
                "created_at": "2025-11-01T12:00:00Z",
                "updated_at": "2025-11-01T12:05:00Z",
            }
        }
    )

class ChatModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    title: Optional[str] = None
    user_id: str
    conversations: List[PseudoConversationModel] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        json_encoders={ObjectId: str},
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "user_id": "user123",
                "title": "Physics Discussion",
                "conversations": [
                    {
                        "prev_conversation": "conversation123",
                        "parent_conversation": "conversation123",
                        "created_at": "2025-11-01T12:00:00Z",
                        "updated_at": "2025-11-01T12:05:00Z"
                    }
                ],
                "created_at": "2025-11-01T12:00:00Z",
                "updated_at": "2025-11-01T12:05:00Z"
            }
        }
    )
    
    def add_conversation(self, conversation: ConversationModel) -> None:
        """Add a new conversation to the chat."""
        self.conversations.append(conversation)
        self.updated_at = datetime.utcnow()
    
    def get_latest_conversation(self) -> Optional[ConversationModel]:
        """Get the most recent conversation."""
        if not self.conversations:
            return None
        return max(self.conversations, key=lambda x: x.updated_at)