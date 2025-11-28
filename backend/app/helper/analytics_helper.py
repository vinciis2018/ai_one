from typing import Dict, List, Any
from datetime import datetime, timedelta
from app.config.db import get_collection
from app.models.student_knowledge import StudentKnowledgeGraph
from bson import ObjectId

async def aggregate_student_stats(student_id: str, days: int = 30) -> Dict[str, Any]:
    """
    Aggregates student knowledge graph data for analytics.
    
    Args:
        student_id: The ID of the student.
        days: Number of days to look back (default 30).
        
    Returns:
        Dictionary containing:
        - topic_distribution: {Subject: {Topic: count}}
        - interaction_profile: {InteractionType: count}
        - recent_activity: List of last 5 interactions
        - weak_areas: List of topics with high "Conceptual Doubt"
        - quiz_metrics: Quiz performance statistics including accuracy
    """
    collection = get_collection("student_knowledge_graph")
    
    # Calculate start date
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Fetch data
    cursor = collection.find({
        "student_id": student_id,
        "timestamp": {"$gte": start_date}
    })
    
    entries = await cursor.to_list(length=None)
    
    # Initialize structures
    topic_dist = {}
    interaction_profile = {}
    recent_activity = []
    weak_area_counts = {}
    
    # Quiz metrics
    quiz_metrics = {
        "total_micro_quizzes": 0,
        "total_questions": 0,
        "multiple_choice_correct": 0,
        "multiple_choice_incorrect": 0,
        "short_answer_attempted": 0,
        "short_answer_unanswered": 0,
        "accuracy_percentage": 0.0
    }
    
    # Process entries
    # Sort by timestamp desc for recent activity
    sorted_entries = sorted(entries, key=lambda x: x["timestamp"], reverse=True)
    
    for i, entry in enumerate(sorted_entries):
        # 1. Recent Activity (Top 5)
        if i < 5:
            recent_activity.append({
                "subject": entry.get("subject"),
                "topic": entry.get("topic"),
                "interaction_type": entry.get("interaction_type"),
                "timestamp": entry.get("timestamp")
            })
            
        subject = entry.get("subject", "Unknown")
        topic = entry.get("topic", "General")
        interaction = entry.get("interaction_type", "Casual")
        
        # 2. Topic Distribution
        if subject not in topic_dist:
            topic_dist[subject] = {}
        topic_dist[subject][topic] = topic_dist[subject].get(topic, 0) + 1
        
        # 3. Interaction Profile
        interaction_profile[interaction] = interaction_profile.get(interaction, 0) + 1
        
        # 4. Weak Areas (Conceptual Doubts)
        if interaction == "Conceptual Doubt":
            key = f"{subject} > {topic}"
            weak_area_counts[key] = weak_area_counts.get(key, 0) + 1
        
        # 5. Quiz Metrics
        quick_action = entry.get("quick_action")
        if quick_action and isinstance(quick_action, dict):
            micro_quiz = quick_action.get("micro_quiz")
            if micro_quiz and isinstance(micro_quiz, list) and len(micro_quiz) > 0:
                quiz_metrics["total_micro_quizzes"] += 1
                
                for question in micro_quiz:
                    if not isinstance(question, dict):
                        continue
                        
                    quiz_metrics["total_questions"] += 1
                    question_type = question.get("question_type")
                    user_answer = question.get("user_answer")
                    
                    if question_type == "multiple_choice":
                        correct_answer = question.get("correct_answer")
                        print("user_answer", user_answer)
                        print("correct_answer", correct_answer)
                        if user_answer and correct_answer:
                            # Check if user_answer matches correct_answer
                            # User answer might be full text like "B. Sharing of..." or just "B"
                            user_ans_clean = user_answer.strip()
                            correct_opt_clean = correct_answer.strip()
                            print("user_answer", user_ans_clean)
                            print("correct_answer", correct_opt_clean)
                            # Extract letter prefix if present (e.g., "B." from "B. Sharing...")
                            if len(user_ans_clean) > 0 and user_ans_clean[0].isalpha():
                                user_letter = user_ans_clean[0].upper()
                            else:
                                user_letter = None
                            
                            if len(correct_opt_clean) > 0 and correct_opt_clean[0].isalpha():
                                correct_letter = correct_opt_clean[0].upper()
                            else:
                                correct_letter = None
                            
                            # Compare either full text or letter prefix
                            if (user_ans_clean == correct_opt_clean or 
                                (user_letter and correct_letter and user_letter == correct_letter)):
                                quiz_metrics["multiple_choice_correct"] += 1
                            else:
                                quiz_metrics["multiple_choice_incorrect"] += 1
                    
                    elif question_type == "short_answer":
                        if user_answer is not None and user_answer != "":
                            quiz_metrics["short_answer_attempted"] += 1
                        else:
                            quiz_metrics["short_answer_unanswered"] += 1

    # Calculate accuracy percentage
    total_mc = quiz_metrics["multiple_choice_correct"] + quiz_metrics["multiple_choice_incorrect"]
    if total_mc > 0:
        quiz_metrics["accuracy_percentage"] = round(
            (quiz_metrics["multiple_choice_correct"] / total_mc) * 100, 2
        )

    # Format Weak Areas (Top 3)
    sorted_weak_areas = sorted(weak_area_counts.items(), key=lambda x: x[1], reverse=True)[:3]
    weak_areas = [{"topic": k, "count": v} for k, v in sorted_weak_areas]
    
    return {
        "topic_distribution": topic_dist,
        "interaction_profile": interaction_profile,
        "recent_activity": recent_activity,
        "weak_areas": weak_areas,
        "total_interactions": len(entries),
        "quiz_metrics": quiz_metrics
    }


async def aggregate_teacher_landing_page_stats(teacher_id: ObjectId, days: int = 30) -> Dict[str, Any]:
    """
    Aggregates teacher statistics for landing page analytics.
    
    Args:
        teacher_id: The ObjectId of the teacher's user_id.
        days: Number of days to look back (default 30).
        
    Returns:
        Dictionary containing:
        - total_chats: Number of chats as teacher
        - total_conversations: Number of conversations (messages)
        - total_documents: Number of documents
        - total_students: Number of students
    """
    # Get teacher document
    teachers_collection = get_collection("teachers")
    teacher = await teachers_collection.find_one({"user_id": teacher_id})
    
    if not teacher:
        return {
            "total_chats": 0,
            "total_conversations": 0,
            "total_documents": 0,
            "total_students": 0
        }
    
    # Calculate start date
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # 1. Get total chats where teacher_id matches
    chats_collection = get_collection("chats")
    
    total_chats = await chats_collection.count_documents({
        "teacher_id": str(teacher_id),
        "created_at": {"$gte": start_date}
    })
    
    # 2. Get total conversations from those chats
    chats_cursor = chats_collection.find({
        "teacher_id": str(teacher_id),
        "created_at": {"$gte": start_date}
    })
    chats = await chats_cursor.to_list(length=None)
    
    total_conversations = 0
    for chat in chats:
        total_conversations += len(chat.get("conversations", []))
    
    # 3. Get total documents
    total_documents = len(teacher.get("documents", []))
    
    # 4. Get total students
    total_students = len(teacher.get("students", []))
    
    return {
        "total_chats": total_chats,
        "total_conversations": total_conversations,
        "total_documents": total_documents,
        "total_students": total_students
    }


async def aggregate_student_landing_page_stats(student_id: ObjectId, days: int = 30) -> Dict[str, Any]:
    """
    Aggregates student statistics for landing page analytics.
    
    Args:
        student_id: The ObjectId of the student's user_id.
        days: Number of days to look back (default 30).
        
    Returns:
        Dictionary containing:
        - total_teachers: Number of teachers
        - total_quizzes: Number of micro quizzes completed
        - total_chats: Number of chats
        - total_documents: Number of documents
    """
    # Get student document
    students_collection = get_collection("students")
    student = await students_collection.find_one({"user_id": student_id})
    
    if not student:
        return {
            "total_teachers": 0,
            "total_quizzes": 0,
            "total_chats": 0,
            "total_documents": 0
        }
    
    # Calculate start date
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # 1. Get total teachers
    total_teachers = len(student.get("teachers", []))
    
    # 2. Get total quizzes from student knowledge graph
    kg_collection = get_collection("student_knowledge_graph")
    kg_cursor = kg_collection.find({
        "student_id": str(student_id),
        "timestamp": {"$gte": start_date}
    })
    kg_entries = await kg_cursor.to_list(length=None)
    
    total_quizzes = 0
    for entry in kg_entries:
        quick_action = entry.get("quick_action")
        if quick_action and isinstance(quick_action, dict):
            micro_quiz = quick_action.get("micro_quiz")
            if micro_quiz and isinstance(micro_quiz, list) and len(micro_quiz) > 0:
                total_quizzes += 1
    
    # 3. Get total chats where student is the user
    chats_collection = get_collection("chats")
    total_chats = await chats_collection.count_documents({
        "user_id": str(student_id),
        "created_at": {"$gte": start_date}
    })
    
    # 4. Get total documents
    total_documents = len(student.get("documents", []))
    
    return {
        "total_teachers": total_teachers,
        "total_quizzes": total_quizzes,
        "total_chats": total_chats,
        "total_documents": total_documents
    }
