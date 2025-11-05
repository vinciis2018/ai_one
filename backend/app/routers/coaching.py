from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from app.models.organisation import OrganisationModel, TeacherModel, StudentModel, UserRole
from app.models.schemas import PyObjectId
from app.config.db import db
from app.helper.user_helper import get_current_active_user
from app.models.user import UserModel

router = APIRouter()

@router.post("/", response_model=OrganisationModel, status_code=status.HTTP_201_CREATED)
async def create_institute(
    institute: OrganisationModel,
    current_user: UserModel = Depends(get_current_active_user)
):
    """
    Create a new coaching institute.
    Only users with admin role can create institutes.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can create institutes"
        )
    
    # Set timestamps
    now = datetime.utcnow()
    institute.created_at = now
    institute.updated_at = now
    
    # Insert into database
    result = await db["organisations"].insert_one(institute.model_dump(by_alias=True, exclude={"id"}))
    created_institute = await db["organisations"].find_one({"_id": result.inserted_id})
    
    return created_institute

@router.get("/", response_model=List[OrganisationModel])
async def list_institutes(
    skip: int = 0,
    limit: int = 10,
):
    """
    List all coaching institutes with pagination.
    """
    cursor = db["organisations"].find().skip(skip).limit(limit)
    return await cursor.to_list(length=limit)

@router.get("/{coaching_id}", response_model=OrganisationModel)
async def get_coaching(
    coaching_id: str,
):
    """
    Get details of a specific coaching institute by ID.
    """
    if (coaching := await db["organisations"].find_one({"_id": ObjectId(coaching_id)})) is not None:
        return coaching
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Coaching with ID {coaching_id} not found"
    )


@router.post("/{coaching_id}/teachers/", status_code=status.HTTP_201_CREATED)
async def add_teacher_to_coaching(
    coaching_id: str,
    teacher: TeacherModel,
):
    """
    Add a teacher to a coaching institute.
    Only teacher can add itself.
    """
    # Verify coaching exists
    coaching = await db["organisations"].find_one({"_id": ObjectId(coaching_id)})
    if not coaching:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coaching with ID {coaching_id} not found"
        )
    
    # Check if teacher with same user_id already exists
    existing_teacher = await db["teachers"].find_one({"user_id": teacher.user_id})
    
    if existing_teacher:
        # If teacher exists, check if already in this coaching
        if existing_teacher["_id"] in coaching.get("teachers", []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Teacher already exists in this coaching"
            )
        
        # Add existing teacher to coaching
        teacher_id = existing_teacher["_id"]
    else:
        # Create new teacher
        now = datetime.utcnow()
        teacher.created_at = now
        teacher.updated_at = now
        
        result = await db["teachers"].insert_one(
            teacher.model_dump(by_alias=True, exclude={"id"})
        )
        teacher_id = result.inserted_id
    
    # Add teacher to coaching's teachers list if not already present
    if teacher_id not in coaching.get("teachers", []):
        await db["organisations"].update_one(
            {"_id": ObjectId(coaching_id)},
            {"$addToSet": {"teachers": teacher_id}},
            upsert=True
        )
    
    return {
        "message": "Teacher added to coaching successfully",
        "teacher_id": str(teacher_id)
    }



@router.get("/{coaching_id}/teachers/", response_model=List[TeacherModel])
async def list_coaching_teachers(
    coaching_id: str,
):
    """
    List all teachers in a specific coaching institute.
    """
    # Verify coaching exists
    coaching = await db["organisations"].find_one({"_id": ObjectId(coaching_id)})
    if not coaching:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coaching with ID {coaching_id} not found"
        )
    
    # Get all teachers for this coaching
    teacher_ids = [ObjectId(tid) for tid in coaching.get("teachers", [])]
    cursor = db["teachers"].find({"_id": {"$in": teacher_ids}})
    return await cursor.to_list(length=100)  # Limit to 100 teachers per page



@router.post("/{coaching_id}/students/", status_code=status.HTTP_201_CREATED)
async def add_student_to_coaching(
    coaching_id: str,
    student: StudentModel,
):
    """
    Add a student to a coaching institute.
    Only student can add itself.
    """
    # Verify institute exists
    coaching = await db["organisations"].find_one({"_id": ObjectId(coaching_id)})
    if not coaching:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coaching with ID {coaching_id} not found"
        )
    
    # Check if student with same user_id already exists
    existing_student = await db["students"].find_one({"user_id": student.user_id})
    
    if existing_student:
        # If student exists, check if already in this coaching
        if existing_student["_id"] in coaching.get("students", []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student already exists in this coaching"
            )
        
        # Add existing student to coaching
        student_id = existing_student["_id"]
    else:
        # Create new student
        now = datetime.utcnow()
        student.created_at = now
        student.updated_at = now
        
        result = await db["students"].insert_one(
            student.model_dump(by_alias=True, exclude={"id"})
        )
        student_id = result.inserted_id
    
    # Add student to coaching's students list if not already present
    if student_id not in coaching.get("students", []):
        await db["organisations"].update_one(
            {"_id": ObjectId(coaching_id)},
            {"$addToSet": {"students": student_id}},
            upsert=True
        )
    
    return {
        "message": "Student added to coaching successfully",
        "student_id": str(student_id)
    }


@router.get("/{coaching_id}/students/", response_model=List[StudentModel])
async def list_institute_students(
    coaching_id: str,
):
    """
    List all students in a specific coaching coaching.
    """
    # Verify institute exists
    coaching = await db["organisations"].find_one({"_id": ObjectId(coaching_id)})
    if not coaching:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coaching with ID {coaching_id} not found"
        )
    
    # Get all students for this coaching
    student_ids = [ObjectId(sid) for sid in coaching.get("students", [])]
    cursor = db["students"].find({"_id": {"$in": student_ids}})
    return await cursor.to_list(length=100)  # Limit to 100 students per page