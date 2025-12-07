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
    
    if not query or not user_id or state["directive"] != "NORMAL":
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
        - "Conceptual Doubt"
        - "Numerical Problem"
        - "Strategy Question"
        - "Casual"

        Then generate a "quick_action" object STRICTLY in the format below.

        Your response MUST be ONLY a JSON object with EXACTLY these keys:
        - "subject"
        - "chapter"
        - "topic"
        - "micro_concept"
        - "interaction_type"
        - "quick_action"

        The "quick_action" MUST be an object with EXACTLY:
        - "micro_quiz": an array of EXACTLY 2 objects
        - "follow_on_concept": a string > explaining how the follow-on concept will help further

        In the 1st quiz object MUST have:
        question_type with "multiple_choice" as value.
        question with str as value.
        options with A, B, C, D as keys and options' str as value.
        correct_answer with A, B, C or D as value.
        
        The 2nd quiz object MUST have:
        question_type with "short_answer" as value.
        question with str as value.
        correct_answer with str as value.

        If any category is not applicable, fill it with null (NOT empty string).

        DO NOT add explanations, text outside JSON, or additional fields.

        """
        
        # 3. Call LLM
        # Using a lower temperature for deterministic classification
        LLM_MODE = "huggingface"
        response_text = call_llm(prompt, LLM_MODE)
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
