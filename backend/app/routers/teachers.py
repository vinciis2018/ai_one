# ============================================
# teachers.py
# Exposes endpoints for listing and managing conversation history
# (MongoDB version with search + pagination)
# ============================================

from fastapi import APIRouter, HTTPException, Query
from pymongo import DESCENDING
from app.config.db import db, get_collection
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def list_teachers(
    skip: int = 0, 
    limit: int = 20, 
    user_id: str = Query(..., description="ID of the student user"),
    search: str = Query(None, description="Optional search term for teacher name or email")
):
    """
    List all teachers from the organization where the student is enrolled.
    """
    try:
        # Convert string ID to ObjectId
        user_oid = ObjectId(user_id)
        student_collection = get_collection("students")
        student = await student_collection.find_one({"user_id": user_oid})

        if user_oid == None or student == None:
          raise HTTPException(status_code=400, detail="Invalid student user ID format")
        # Find the organization that has this student
        coaching_collection = get_collection("organisations")
        coaching = await coaching_collection.find_one({"students": {"$in": [student.get("_id")]}})

        if not coaching:
            return {"teachers": [], "count": 0}

        # Build the query for teachers
        query = {
            "_id": {"$in": coaching.get("teachers", [])}
        }

        # Add search filter if provided
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]

        # Get teacher details
        cursor = db["teachers"].find(query).skip(skip).limit(limit)
        teachers = await cursor.to_list(length=limit)

        # Get total count for pagination
        total = await db["teachers"].count_documents(query)

        # Format the response
        result = []
        for teacher in teachers:
            # Get user details
            user = await db["users"].find_one(
                {"_id": teacher["user_id"]},
                {"password": 0}  # Exclude password
            )
            
            if user:
                result.append({
                    "id": str(teacher["_id"]),
                    "user_id": str(teacher["user_id"]),
                    "name": teacher.get("name", ""),
                    "email": teacher.get("email", ""),
                    "subjects": teacher.get("subjects", []),
                    "documents": [str(doc_id) for doc_id in teacher.get("documents", [])],
                    "students": [str(student_id) for student_id in teacher.get("students", [])],
                    "avatar": teacher.get("avatar", ""),
                    "created_at": str(teacher.get("created_at", ""))
                })
        return {
            "teachers": result,
            "count": len(result),
            "total": total,
            "has_more": (skip + len(result)) < total
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching teachers: {str(e)}"
        )



@router.get("/{id}")
async def get_teacher_details(
    id: str
):
    """
    Get detailed information about a specific teacher by their ID.
    """
    try:
        # Validate teacher_id format
        try:
            user_oid = ObjectId(id)
        except:
            raise HTTPException(status_code=400, detail="Invalid teacher ID format")
        # Get user details
        user = await db["users"].find_one(
            {"_id": user_oid},
            {"password": 0}  # Exclude password
        )

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get teacher details
        teacher = await db["teachers"].find_one({"user_id": user_oid})
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")

        teacher_id = teacher["_id"]

        if not teacher_id:
            raise HTTPException(status_code=404, detail="Teacher details not found")
        
        # Get organization details
        org = await db["organisations"].find_one(
            {"teachers": teacher_id},
            {"name": 1, "_id": 1}  # Only get necessary fields
        )

        # Prepare response
        response = {
            "id": str(teacher["_id"]),
            "user_id": str(teacher["user_id"]),
            "name": teacher.get("name", ""),
            "email": teacher.get("email", ""),
            "subjects": teacher.get("subjects", []),
            "documents": [str(doc["document_id"]) for doc in teacher.get("documents", [])],
            "students": [str(student_id) for student_id in teacher.get("students", [])],
            "avatar": teacher.get("avatar", user.get("avatar", "")),
            "created_at": str(teacher.get("created_at", "")),
            "organization": {
                "id": str(org["_id"]) if org else None,
                "name": org.get("name") if org else None
            } if org else None
        }

        return response

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_teacher_details: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching teacher details: {str(e)}"
        )