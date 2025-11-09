# ============================================
# students.py
# Exposes endpoints for listing and managing conversation history
# (MongoDB version with search + pagination)
# ============================================

from fastapi import APIRouter, HTTPException, Query
from pymongo import DESCENDING
from app.config.db import db, get_collection
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def list_students(
    skip: int = 0, 
    limit: int = 20, 
    user_id: str = Query(..., description="ID of the student user"),
    search: str = Query(None, description="Optional search term for student name or email")
):
    """
    List all students from the organization where the student is enrolled.
    """
    try:
        # Convert string ID to ObjectId
        user_oid = ObjectId(user_id)
        teacher_collection = get_collection("teachers")
        teacher = await teacher_collection.find_one({"user_id": user_oid})

        if user_oid == None or teacher == None:
          raise HTTPException(status_code=400, detail="Invalid teacher user ID format")
        # Find the organization that has this student
        coaching_collection = get_collection("organisations")
        coaching = await coaching_collection.find_one({"teachers": {"$in": [teacher.get("_id")]}})

        if not coaching:
            return {"students": [], "count": 0}

        # Build the query for students
        query = {
            "_id": {"$in": coaching.get("students", [])}
        }

        # Add search filter if provided
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]

        # Get student details
        cursor = db["students"].find(query).skip(skip).limit(limit)
        students = await cursor.to_list(length=limit)

        # Get total count for pagination
        total = await db["students"].count_documents(query)

        # Format the response
        result = []
        for student in students:
            # Get user details
            user = await db["users"].find_one(
                {"_id": student["user_id"]},
                {"password": 0}  # Exclude password
            )
            
            if user:
                result.append({
                    "id": str(student["_id"]),
                    "user_id": str(student["user_id"]),
                    "name": student.get("name", ""),
                    "email": student.get("email", ""),
                    "subjects": student.get("subjects", []),
                    "documents": [str(doc_id) for doc_id in student.get("documents", [])],
                    "students": [str(student_id) for student_id in student.get("students", [])],
                    "avatar": student.get("avatar", ""),
                    "created_at": str(student.get("created_at", ""))
                })
        return {
            "students": result,
            "count": len(result),
            "total": total,
            "has_more": (skip + len(result)) < total
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching students: {str(e)}"
        )



@router.get("/{id}")
async def get_student_details(
    id: str
):
    """
    Get detailed information about a specific student by their ID.
    """
    try:
        # Validate student_id format
        try:
            user_oid = ObjectId(id)
        except:
            raise HTTPException(status_code=400, detail="Invalid student ID format")
        # Get user details
        user = await db["users"].find_one(
            {"_id": user_oid},
            {"password": 0}  # Exclude password
        )

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get student details
        student = await db["students"].find_one({"user_id": user_oid})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        student_id = student["_id"]

        if not student_id:
            raise HTTPException(status_code=404, detail="Student details not found")
        
        # Get organization details
        org = await db["organisations"].find_one(
            {"students": student_id},
            {"name": 1, "_id": 1}  # Only get necessary fields
        )

        # Prepare response
        response = {
            "id": str(student["_id"]),
            "user_id": str(student["user_id"]),
            "name": student.get("name", ""),
            "email": student.get("email", ""),
            "subjects": student.get("subjects", []),
            "documents": [str(doc["document_id"]) for doc in student.get("documents", [])],
            "teachers": [str(teacher_id) for teacher_id in student.get("teachers", [])],
            "avatar": student.get("avatar", user.get("avatar", "")),
            "created_at": str(student.get("created_at", "")),
            "organization": {
                "id": str(org["_id"]) if org else None,
                "name": org.get("name") if org else None
            } if org else None
        }

        return response

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_student_details: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching student details: {str(e)}"
        )