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
    # current_user: UserModel = Depends(get_current_active_user)
):
    """
    Create a new coaching institute.
    Only users with admin role can create institutes.
    """
    # if current_user.role != UserRole.ADMIN:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Only admin users can create institutes"
    #     )
    
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
    limit: int = 100,
):
    """
    List all coaching institutes with pagination.
    """
    cursor = db["organisations"].find().skip(skip).limit(limit)
    print(cursor)
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



@router.get("/{coaching_id}/teachers/", response_model=List[TeacherModel])
async def list_institute_teachers(
    coaching_id: str,
):
    """
    List all teachers in a specific coaching.
    """
    try:
        # Verify institute exists
        coaching = await db["organisations"].find_one({"_id": ObjectId(coaching_id)})

        if not coaching:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Coaching with ID {coaching_id} not found"
            )
        
        # Get all teachers for this coaching
        teacher_ids = [ObjectId(tid) for tid in coaching.get("teachers", [])]

        cursor = db["teachers"].find({"_id": {"$in": teacher_ids}})

        teachers = await cursor.to_list(None)
        print("teachers", teachers)
        
        # Convert ObjectId to string for response
        for teacher in teachers:
            teacher["_id"] = str(teacher["_id"])
            if "user_id" in teacher:
                teacher["user_id"] = str(teacher["user_id"])
            if "students" in teacher:
                teacher["students"] = [str(sid) for sid in teacher["students"]] if teacher["students"] else []
            if "subjects" in teacher and not teacher["subjects"]:
                teacher["subjects"] = []
            if "documents" in teacher and not teacher["documents"]:
                teacher["documents"] = []
            # Handle classrooms - they are stored as embedded documents, not ObjectId references
            # Convert them to a list of classroom IDs for the response model
            if "classrooms" in teacher and teacher["classrooms"]:
                # Extract just the _id from each classroom object
                teacher["classrooms"] = [classroom.get("_id") for classroom in teacher["classrooms"] if classroom.get("_id")]
            else:
                teacher["classrooms"] = []
        
        return teachers

    except Exception as e:
        print(f"Error listing teachers: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching teachers: {str(e)}"
        )


@router.get("/{coaching_id}/students/", response_model=List[StudentModel])
async def list_institute_students(
    coaching_id: str,
):
    """
    List all students in a specific coaching.
    """
    try:
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
        students = await cursor.to_list(None)
        
        # Convert ObjectId to string for response
        for student in students:
            student["_id"] = str(student["_id"])
            if "user_id" in student:
                student["user_id"] = str(student["user_id"])
            if "teachers" in student:
                student["teachers"] = [str(tid) for tid in student["teachers"]] if student["teachers"] else []
            if "subjects" in student and not student["subjects"]:
                student["subjects"] = []
            if "documents" in student and not student["documents"]:
                student["documents"] = []
            # Handle classrooms - they are stored as embedded documents, not ObjectId references
            # Convert them to a list of classroom IDs for the response model
            if "classrooms" in student and student["classrooms"]:
                # Extract just the _id from each classroom object
                student["classrooms"] = [classroom.get("_id") for classroom in student["classrooms"] if classroom.get("_id")]
            else:
                student["classrooms"] = []
        return students

    except Exception as e:
        print(f"Error listing students: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching students: {str(e)}"
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
            {"$addToSet": {
                "teachers": teacher_id,
            }},
            upsert=True
        )
    
    return {
        "message": "Teacher added to coaching successfully",
        "teacher_id": str(teacher_id)
    }




@router.post("/{coaching_id}/students/", status_code=status.HTTP_201_CREATED)
async def add_student_to_coaching(
    coaching_id: str,
    student: StudentModel,
    subjects: List[str],
):
    """
    Add a student to a coaching institute and update related models.
    - Adds student to coaching's students list
    - Adds student to each teacher's students list in the coaching
    - Updates domains in the organization based on subjects
    """
    try:
        # Validate coaching_id
        try:
            coaching_oid = ObjectId(coaching_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid coaching ID format")

        # Check if coaching exists
        coaching = await db["organisations"].find_one({"_id": coaching_oid})
        if not coaching:
            raise HTTPException(status_code=404, detail="Coaching not found")

        # Check if student already exists
        existing_student = await db["students"].find_one({"email": student.email, "user_id": student.user_id})
        
        if existing_student:
            # If student exists, check if already in this coaching
            if existing_student["_id"] in coaching.get("students", []):
                raise HTTPException(
                    status_code=400,
                    detail="Student already exists in this coaching"
                )
            student_id = existing_student["_id"]
        else:
            # Create new student
            student_data = student.model_dump(by_alias=True, exclude={"id"})
            student_data["created_at"] = datetime.utcnow()
            student_data["updated_at"] = datetime.utcnow()
            
            # Add to students collection
            result = await db["students"].insert_one(student_data)
            student_id = result.inserted_id

        # Get all teachers in this coaching
        teacher_ids = coaching.get("teachers", [])
        
        # Add student to each teacher's students list
        for teacher_id in teacher_ids:
            await db["teachers"].update_one(
                {"_id": teacher_id},
                {"$addToSet": {"students": student_id}},
                upsert=True
            )

        # Add teacher IDs to student's teachers list
        await db["students"].update_one(
            {"_id": student_id},
            {"$addToSet": {
                "teachers": {"$each": teacher_ids},
                "subjects": {"$each": subjects}
            }},
            upsert=True
        )

        # Add student to coaching
        await db["organisations"].update_one(
            {"_id": coaching_oid},
            {"$addToSet": {"students": student_id}}
        )

        # Update domains in organization
        await update_organization_domains(coaching_oid, student_id)

        # Return updated coaching
        updated_coaching = await db["organisations"].find_one({"_id": coaching_oid})
        return updated_coaching

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error adding student to coaching: {str(e)}"
        )




@router.post("/add/student/{teacher_id}/", status_code=status.HTTP_201_CREATED)
async def add_student_to_teacher(
    teacher_id: str,
    student: StudentModel,
):
    """
    Add a student to a teacher and update related models.
    - Adds student to teacher's students list
    - Updates student's teachers list
    - Adds student to coaching if not already present
    - Updates domains in the organization
    """
    try:
        # Check if student already exists
        existing_student = await db["students"].find_one({"email": student.email, "user_id": student.user_id})
        
        # Find the coaching that has this teacher
        coaching = await db["organisations"].find_one(
            {"teachers": ObjectId(teacher_id)}
        )
        if not coaching:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Teacher not found in any coaching or invalid teacher ID"
            )

        coaching_oid = coaching["_id"]
        print(coaching_oid)
        
        # Add student to teacher's students list
        await db["teachers"].update_one(
            {"_id": ObjectId(teacher_id)},
            {"$addToSet": {"students": existing_student.get("_id")}},
            upsert=True
        )

        # Add teacher to student's teacher list
        await db["students"].update_one(
            {"_id": ObjectId(existing_student.get("_id"))},
            {"$addToSet": {"teachers": ObjectId(teacher_id)}},
            upsert=True
        )

        # Add student to coaching if not already present
        if existing_student.get("_id") not in coaching.get("students", []):
            await db["organisations"].update_one(
                {"_id": coaching_oid},
                {"$addToSet": {"students": existing_student.get("_id")}},
                upsert=True
            )

        # Update domains in organization
        await update_organization_domains(coaching_oid, existing_student.get("_id"))

        # Return success response instead of the document
        return {
            "message": "Student added to teacher successfully",
            "student_id": str(existing_student.get("_id")),
            "teacher_id": teacher_id,
            "coaching_id": str(coaching_oid)
        }

    except Exception as e:
        logger.error(f"Error in add_student_to_teacher: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error adding student to teacher: {str(e)}"
        )


async def update_organization_domains(coaching_oid: ObjectId, student_id: ObjectId):
    """Update domains in organization based on subjects from teachers and students"""
    try:
        # Get organization data with teachers and current domains
        org = await db["organisations"].find_one(
            {"_id": coaching_oid}, 
            {"teachers": 1, "domains": 1}
        )
        teachers_ids = org.get("teachers", [])
        
        # Get all teachers with their subjects
        teachers = await db["teachers"].find(
            {"_id": {"$in": teachers_ids}},
            {"_id": 1, "name": 1, "subjects": 1}
        ).to_list(None)

        # Get student data
        student = await db["students"].find_one(
            {"_id": student_id},
            {"subjects": 1}
        )
        student_subjects = student.get("subjects", []) if student else []

        # Get current domains
        current_domains = {d["name"]: d for d in org.get("domains", [])}

        # Process teacher subjects
        teacher_subjects_map = {}
        for teacher in teachers:
            for subject in teacher.get("subjects", []):
                if subject not in teacher_subjects_map:
                    teacher_subjects_map[subject] = []
                teacher_subjects_map[subject].append({
                    "teacher_id": teacher["_id"],
                    "teacher_name": teacher.get("name", "")
                })

        # Combine all subjects
        all_subjects = set(list(teacher_subjects_map.keys()) + student_subjects)

        # Update domains
        updated_domains = []
        for subject in all_subjects:
            domain_data = current_domains.get(subject, {
                "_id": ObjectId(),
                "name": subject,
                "teachers": []
            })

            await db["students"].update_one(
                {"_id": student_id},
                {"$addToSet": {
                    "subjects": subject,
                }},
                upsert=True
            )

            # Update teachers for this subject
            existing_teachers = {str(t["teacher_id"]): t for t in domain_data.get("teachers", [])}

            # Add/update teachers from teacher_subjects_map
            for teacher_info in teacher_subjects_map.get(subject, []):
                teacher_id = str(teacher_info["teacher_id"])
                if teacher_id not in existing_teachers:
                    existing_teachers[teacher_id] = {
                        "teacher_id": ObjectId(teacher_id),
                        "teacher_name": teacher_info["teacher_name"],
                        "students": [student_id]  # Initialize with current student
                    }
                else:
                    # Add student to existing teacher if not already in the list
                    if student_id not in existing_teachers[teacher_id].get("students", []):
                        existing_teachers[teacher_id].setdefault("students", []).append(student_id)

                # Convert back to list and update domain
                domain_data["teachers"] = list(existing_teachers.values())
                updated_domains.append(domain_data)

        # Update organization with new domains
        await db["organisations"].update_one(
            {"_id": coaching_oid},
            {"$set": {"domains": updated_domains}}
        )

    except Exception as e:
        print(f"Error updating organization domains: {str(e)}")
        raise

