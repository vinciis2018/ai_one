from app.models.schemas import PyObjectId
from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId
from datetime import datetime

class DocumentModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    filename: Optional[str] = None
    subject: Optional[str] = None
    domain: Optional[str] = None
    type: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    chunk_text: str
    chunk_docs_ids: List[PyObjectId]
    embedding: Optional[List[float]] = None
    source_type: str = Field(..., description="Type of knowledge base: general | coaching | student")
    s3_url: Optional[str] = Field(None, description="S3 file location if uploaded via AWS")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "json_encoders": {ObjectId: str},
        "arbitrary_types_allowed": True,
        "json_schema_extra": {
            "example": {
                "filename": "chapter1.pdf",
                "chunk_text": "Newton's second law states that force equals mass times acceleration.",
                "embedding": [0.12, 0.34, 0.56],
                "chunk_docs_ids": [ObjectId("678901234567890123456789")],
                "source_type": "student",
                "s3_url": "https://your-bucket.s3.ap-south-1.amazonaws.com/chapter1.pdf",
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
                "source_type": "student",
                "s3_url": "https://example.com/file.pdf",
                "created_at": "2025-11-01T12:00:00Z",
            }
        })
        return json_schema