# ============================================
# document.py
# MongoDB model + Pydantic schema for documents
# ============================================

from datetime import datetime
from typing import Optional
from app.models.schemas import PyObjectId
from pydantic import BaseModel, Field, ConfigDict, field_serializer
from pydantic.json_schema import JsonSchemaMode


# =====================================================
# Core User Model (MongoDB schema)
# =====================================================
class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    username: Optional[str] = None
    avatar: Optional[str] = "https://imgs.search.brave.com/z3fePv7Epr5rm8IuE1MQi-WfbaUfFbKpMFnY4q6ORZM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMjcv/OTUxLzEzNS9zbWFs/bC9zdHlsaXNoLWF1/bnR5LTNkLWF2YXRh/ci1jaGFyYWN0ZXIt/aWxsdXN0cmF0aW9u/cy1wbmcucG5n"
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    organisation_id: Optional[str] = None
    is_active: Optional[bool] = None
    is_deleted: Optional[bool] = None
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "username": "Ramesh",
                "firstName": "Ramesh",
                "lastName": "Bhai",
                "email": "ramesh@gmail.com",
                "password": "123456",
                "role": "student",
                "organisation_id": "wqe3211212ewdasd",
                "is_active": True,
                "is_deleted": False,
                "last_login": "2025-11-01T12:00:00Z",
                "created_at": "2025-11-01T12:00:00Z",
                "updated_at": "2025-11-01T12:00:00Z",
            }
        }
    )

    @field_serializer('id')
    def serialize_id(self, id: Optional[PyObjectId], _info) -> Optional[str]:
        return str(id) if id else None
