# ============================================
# teachers.py
# Exposes endpoints for listing and managing conversation history
# (MongoDB version with search + pagination)
# ============================================
from app.models.organisation import ClassroomModel
from app.helper.analytics_helper import aggregate_student_stats, aggregate_teacher_landing_page_stats
from fastapi import APIRouter, HTTPException, Query, Body
from pymongo import DESCENDING
from app.config.db import db, get_collection
from bson import ObjectId
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

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



@router.get("/{user_id}")
async def get_teacher_details(
    user_id: str
):
    """
    Get detailed information about a specific teacher by their ID.
    """
    try:
        # Validate teacher_id format
        try:
            user_oid = ObjectId(user_id)
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
            } if org else None,
            "calendar": teacher.get("calendar", None),
            "persona": teacher.get("persona", None)
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


class Persona(BaseModel):
    answer_style: str
    personality: Optional[str] = None

@router.put("/update-persona/{teacher_id}")
async def update_teacher_persona(
    teacher_id: str,
    persona: Persona = Body(..., embed=True)
):

    try:
        # Validate teacher_id format
        try:
            teacher_oid = ObjectId(teacher_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid teacher ID format")
        
        # Update teacher persona
        result = await db["teachers"].update_one(
            {"user_id": teacher_oid},
            {"$set": {"persona": persona.model_dump()}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Teacher not found")
        
        return {"message": "Teacher persona updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_teacher_persona: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error updating teacher persona: {str(e)}"
        )


@router.get("/{teacher_id}/landing-page-analytics")
async def get_landing_page_analytics(
    teacher_id: str,
    days: int = Query(30, description="Number of days to look back")
):
    """
    Get analytics for a specific teacher based on their knowledge graph.
    """
    try:
        # Validate teacher_id format
        try:
            teacher_oid = ObjectId(teacher_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid teacher ID format")
        
        stats = await aggregate_teacher_landing_page_stats(teacher_oid, days)
        return stats
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_landing_page_analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching teacher analytics: {str(e)}"
        )


@router.get("/student-analytics/{student_id}")
async def get_student_analytics(
    student_id: str,
    days: int = Query(30, description="Number of days to look back")
):
    """
    Get analytics for a specific student based on their knowledge graph.
    """
    try:
        # Validate student_id format (it's a string in the model, but usually comes from ObjectId)
        # The helper uses it as a string to match the model
        
        stats = await aggregate_student_stats(student_id, days)
        return stats
        
    except Exception as e:
        print(f"Error in get_student_analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching student analytics: {str(e)}"
        )

class CalendarEvent(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    students: List[str] = []
    subject: Optional[str] = None
    location: Optional[str] = None
    recurrence: Optional[str] = None
    status: str = "scheduled"

@router.post("/calendar/event")
async def add_calendar_event(
    teacher_id: str = Body(..., embed=True),
    event: CalendarEvent = Body(..., embed=True)
):
    """
    Add a calendar event (class) to a teacher's profile.
    """
    try:
        # Validate teacher_id format
        try:
            teacher_oid = ObjectId(teacher_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid teacher ID format")

        collection = get_collection("teachers")
        teacher = await collection.find_one({"user_id": teacher_oid})

        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")

        # Prepare event data
        event_data = event.model_dump()
        event_data["event_id"] = str(ObjectId()) # Generate a unique ID for the event

        # Initialize calendar if it doesn't exist
        if not teacher.get("calendar"):
            await collection.update_one(
                {"user_id": teacher_oid},
                {"$set": {"calendar": {"events": []}}}
            )

        # Add event to calendar
        result = await collection.update_one(
            {"user_id": teacher_oid},
            {"$push": {"calendar.events": event_data}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to add event to calendar")

        return {"status": "success", "event_id": event_data["event_id"], "message": "Event added successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in add_calendar_event: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding calendar event: {str(e)}")



@router.post("/classroom/add")
async def add_class_room(
    classroom_details: ClassroomModel = Body(..., embed=True)
):
    try:
        # Validate teacher_id format
        try:
            teacher_oid = ObjectId(classroom_details.teacher_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid teacher ID format")

        collection = get_collection("teachers")

        teacher = await collection.find_one({"user_id": teacher_oid})

        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")

        # Prepare classroom data
        classroom_data = classroom_details.model_dump()
        classroom_data["_id"] = str(ObjectId()) # Generate a unique ID for the classroom

        # Initialize classrooms if it doesn't exist
        if not teacher.get("classrooms"):
            await collection.update_one(
                {"user_id": teacher_oid},
                {"$set": {"classrooms": []}}
            )

        # Add classroom to teacher's profile
        result = await collection.update_one(
            {"user_id": teacher_oid},
            {"$push": {"classrooms": classroom_data}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to add classroom to teacher's profile")

        return {"status": "success", "classroom_id": classroom_data["_id"], "message": "Classroom added successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in add_class_room: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding classroom: {str(e)}")


class TeacherIdsRequest(BaseModel):
    teacher_ids: List[str]


@router.post("/classrooms/all")
async def get_classrooms_by_teachers(
    request: TeacherIdsRequest = Body(...)
):
    """
    Fetch all classrooms related to the provided array of teacher IDs.
    
    Request body:
    {
        "teacher_ids": ["teacher_id_1", "teacher_id_2", ...]
    }
    
    Returns:
    {
        "classrooms": [...],
        "count": int
    }
    """
    try:
        # Validate and convert teacher_ids to ObjectIds
        teacher_oids = []
        for teacher_id in request.teacher_ids:
            try:
                teacher_oids.append(ObjectId(teacher_id))
            except:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid teacher ID format: {teacher_id}"
                )

        if not teacher_oids:
            return {"classrooms": [], "count": 0}

        # Fetch teachers with their classrooms
        collection = get_collection("teachers")
        cursor = collection.find(
            {"user_id": {"$in": teacher_oids}},
            {"classrooms": 1, "user_id": 1, "name": 1, "email": 1}
        )
        teachers = await cursor.to_list(length=None)

        # Aggregate all classrooms from all teachers
        all_classrooms = []
        for teacher in teachers:
            classrooms = teacher.get("classrooms", [])
            
            # Add teacher info to each classroom
            for classroom in classrooms:
                classroom_info = {
                    "classroom_id": classroom.get("_id"),
                    "name": classroom.get("name"),
                    "description": classroom.get("description"),
                    "teacher_id": str(teacher.get("user_id")),
                    "teacher_name": teacher.get("name"),
                    "teacher_email": teacher.get("email"),
                    "student_ids": [str(sid) for sid in classroom.get("student_ids", [])],
                    "created_at": str(classroom.get("created_at", "")),
                    "updated_at": str(classroom.get("updated_at", ""))
                }
                all_classrooms.append(classroom_info)

        return {
            "classrooms": all_classrooms,
            "count": len(all_classrooms)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_classrooms_by_teachers: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching classrooms: {str(e)}"
        )
        
