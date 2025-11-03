from app.models.schemas import PyObjectId
from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId
from datetime import datetime

class ChunkDocumentModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    filename: Optional[str] = None
    chunk_text: str
    embedding: Optional[List[float]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "json_encoders": {ObjectId: str},
        "arbitrary_types_allowed": True,
        "json_schema_extra": {
            "example": {
                "filename": "chapter1.pdf",
                "chunk_text": "Newton's second law states that force equals mass times acceleration.",
                "embedding": [0.12, 0.34, 0.56],
                "created_at": "2025-11-01T12:00:00Z",
            }
        }
    }

    # Add this method to handle serialization of PyObjectId
    @classmethod
    def __get_pydantic_json_schema__(
        cls, schema, handler
    ):
        json_schema = handler(cls)
        json_schema.update({
            "example": {
                "filename": "chapter1.pdf",
                "chunk_text": "Example text",
                "created_at": "2025-11-01T12:00:00Z",
            }
        })
        return json_schema