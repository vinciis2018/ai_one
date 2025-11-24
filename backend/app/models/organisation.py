from app.models.schemas import PyObjectId
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from bson import ObjectId
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

class DocumentAccess(BaseModel):
    document_id: PyObjectId
    access_granted_at: datetime = Field(default_factory=datetime.utcnow)
    can_edit: bool = False

    model_config = {
        "json_encoders": {ObjectId: str},
        "arbitrary_types_allowed": True
    }

class TeacherModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: PyObjectId
    name: str
    avatar: Optional[str] = None
    email: EmailStr
    subjects: List[str] = []
    documents: List[DocumentAccess] = []
    students: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    syllabus: Optional[Dict[str, Any]] = None
    calendar: Optional[Dict[str, Any]] = None  # For class scheduling and Google Calendar integration


    model_config = {
        "json_encoders": {ObjectId: str},
        "arbitrary_types_allowed": True,
        "json_schema_extra": {
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "name": "John Doe",
                "email": "john.doe@example.com",
                "subjects": ["Mathematics", "Physics"],
                "documents": [
                    {
                        "document_id": "607f1f77bcf86cd799439012",
                        "access_granted_at": "2025-11-04T10:00:00Z",
                        "can_edit": True
                    }
                ],
                "calendar": {
                    "google_calendar_id": "teacher@example.com",
                    "timezone": "Asia/Kolkata",
                    "events": [
                        {
                            "event_id": "evt_001",
                            "title": "Physics Class - Grade 10",
                            "description": "Chapter 5: Motion",
                            "start_time": "2025-11-24T10:00:00",
                            "end_time": "2025-11-24T11:00:00",
                            "students": ["student_id_1", "student_id_2"],
                            "subject": "Physics",
                            "location": "Room 101",
                            "recurrence": "weekly",
                            "status": "scheduled"
                        }
                    ]
                },
                "created_at": "2025-11-04T10:00:00Z",
                "updated_at": "2025-11-04T10:00:00Z"
            }
        }
    }

class StudentModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: PyObjectId
    avatar: Optional[str] = None
    name: str
    email: EmailStr
    subjects: List[str] = []
    documents: List[DocumentAccess] = []
    teachers: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    model_config = {
        "json_encoders": {ObjectId: str},
        "arbitrary_types_allowed": True,
        "json_schema_extra": {
            "example": {
                "user_id": "507f1f77bcf86cd799439013",
                "name": "Jane Smith",
                "email": "jane.smith@example.com",
                "subjects": ["Mathematics", "Physics"],
                "documents": [
                    {
                        "document_id": "607f1f77bcf86cd799439012",
                        "access_granted_at": "2025-11-04T10:00:00Z",
                        "can_edit": False
                    }
                ],
                "created_at": "2025-11-04T10:00:00Z",
                "updated_at": "2025-11-04T10:00:00Z"
            }
        }
    }


class TeacherStudent(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    teacher_id: PyObjectId
    teacher_name: str
    students: List[PyObjectId] = []

class SubjectDomains(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    teachers: List[TeacherStudent] = []

class OrganisationModel(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    name: str
    avatar: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    contact_email: EmailStr
    phone: Optional[str] = None
    website: Optional[str] = None
    org_type: Optional[str] = "coaching"
    teachers: List[PyObjectId] = []
    students: List[PyObjectId] = []
    documents: List[DocumentAccess] = []
    subjects: List[str] = []
    domains: List[SubjectDomains] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "json_encoders": {ObjectId: str},
        "arbitrary_types_allowed": True,
        "json_schema_extra": {
            "example": {
                "name": "Excel Coaching Center",
                "description": "A premier coaching institute for competitive exams",
                "address": "123 Education St, Learning City",
                "contact_email": "contact@excelcoaching.com",
                "phone": "+1234567890",
                "website": "https://excelcoaching.com",
                "teachers": ["507f1f77bcf86cd799439011"],
                "students": ["507f1f77bcf86cd799439013"],
                "subjects": ["maths", "physics"],
                "documents": ["607f1f77bcf86cd799439012"],
                "domains": [],
                "created_at": "2025-11-04T10:00:00Z",
                "updated_at": "2025-11-04T10:00:00Z"
            }
        }
    }

    def add_teacher(self, teacher_id: PyObjectId) -> None:
        """Add a teacher to the organization."""
        if teacher_id not in self.teachers:
            self.teachers.append(teacher_id)
            self.updated_at = datetime.utcnow()

    def add_student(self, student_id: PyObjectId) -> None:
        """Add a student to the organization."""
        if student_id not in self.students:
            self.students.append(student_id)
            self.updated_at = datetime.utcnow()

    def add_document(self, document_id: PyObjectId) -> None:
        """Add a document to the organization."""
        if document_id not in self.documents:
            self.documents.append(document_id)
            self.updated_at = datetime.utcnow()

    def grant_document_access(
        self, 
        user_id: PyObjectId, 
        document_id: PyObjectId, 
        can_edit: bool = False,
        user_type: str = "teacher"
    ) -> bool:
        """
        Grant document access to a user.
        Returns True if access was granted, False otherwise.
        """
        # In a real implementation, you would update the user's document access list
        # This is a simplified version
        return True