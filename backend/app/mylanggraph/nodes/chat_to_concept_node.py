from typing import Dict, Any
from app.core.llm_manager import call_llm
from app.data.syllabus_data import get_syllabus_context
from app.models.student_knowledge import StudentKnowledgeGraph
from app.config.db import get_collection
from datetime import datetime
import json
from bson import ObjectId

async def chat_to_concept_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Intercepts user query and maps it to a specific node in the syllabus tree.
    Updates Student_Knowledge_Graph.
    """
    print("---CHAT TO CONCEPT TAGGER---")
    
    query = state.get("query", "")
    user_id = state.get("user_id")
    answer = state.get("answer", "")
    
    if not query or not user_id:
        print("Skipping tagger: Missing query or user_id")
        return state

    try:
        # 1. Get Syllabus Context
        syllabus_context = get_syllabus_context()
        
        # 2. Prepare LLM Prompt
        prompt = f"""
        You are an expert educational classifier. 
        Your task is to map the user's query to a specific node in the provided Syllabus.
        
        Syllabus:
        {syllabus_context}
        
        User Query: "{query}"
        Assistant Answer: "{answer}"
        
        Classify the query into:
        - Subject
        - Chapter
        - Topic
        - Micro-Concept (if applicable)
        
        Also determine the Interaction Type:
        - "Conceptual Doubt" (Understanding concepts, "What is...", "Explain...")
        - "Numerical Problem" (Solving equations, finding values)
        - "Strategy Question" (How to study, exam prep)
        - "Casual" (Greetings, non-academic)

        Also generate a Quick Action:
        - "micro_quiz": 2 short, single-question quiz (one multiple choice with correct option and one short answer question with correct answer) related to the concept to test understanding.
        - "follow_on_concept": Give a polite suggestion for the next logical concept or topic the student should explore.
        
        Return ONLY a JSON object with keys: "subject", "chapter", "topic", "micro_concept", "interaction_type", "quick_action".
        "quick_action" should be an object with keys "micro_quiz" and "follow_on_concept".
        "micro_quiz" should be an array of objects, first object will have question_type = "multiple_choice" and second object will have question_type = "short_answer".
        "follow_on_concept" should be a string.
        If a category is not applicable or not found, use null.
        """
        
        print("userid_query:", user_id, query)
        # 3. Call LLM
        # Using a lower temperature for deterministic classification
        response_text = call_llm(prompt, domain="education")
        print("response_text:", response_text)
        # Clean response to ensure JSON
        response_text = response_text.replace("```json", "").replace("```", "").strip()
        classification = json.loads(response_text)
        
        print(f"Classification Result: {classification}")
        
        # 4. Save to Database
        knowledge_graph_collection = get_collection("student_knowledge_graph")
        
        entry = StudentKnowledgeGraph(
            id=ObjectId(),
            student_id=user_id,
            domain=state.get("domain") or "general",
            subject=classification.get("subject") or "general",
            chapter=classification.get("chapter"),
            topic=classification.get("topic"),
            micro_concept=classification.get("micro_concept"),
            interaction_type=classification.get("interaction_type") or "Casual",
            quick_action=classification.get("quick_action"),
            chat_id=state.get("chat_id"),
            conversation_id=state.get("response_data").get("conversation_id"),
            timestamp=datetime.utcnow()
        )
        
        await knowledge_graph_collection.insert_one(entry.model_dump(by_alias=True))
        print("Saved to Student Knowledge Graph")
        
    except Exception as e:
        print(f"Error in chat_to_concept_node: {str(e)}")
        # We do not fail the flow if tagging fails, just log it.
        
    return state
