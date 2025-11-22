from typing import Dict, Any
from app.core.llm_manager import call_llm
from app.data.syllabus_data import get_syllabus_context
from app.models.student_knowledge import StudentKnowledgeGraph
from app.config.db import get_collection
from datetime import datetime
import json

async def node_chat_to_concept(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Intercepts user query and maps it to a specific node in the syllabus tree.
    Updates Student_Knowledge_Graph.
    """
    print("---CHAT TO CONCEPT TAGGER---")
    
    query = state.get("query", "")
    user_id = state.get("user_id")
    
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
        
        Return ONLY a JSON object with keys: "subject", "chapter", "topic", "micro_concept", "interaction_type".
        If a category is not applicable or not found, use null.
        """
        
        # 3. Call LLM
        # Using a lower temperature for deterministic classification
        response_text = call_llm(prompt, domain="education")
        
        # Clean response to ensure JSON
        response_text = response_text.replace("```json", "").replace("```", "").strip()
        classification = json.loads(response_text)
        
        print(f"Classification Result: {classification}")
        
        # 4. Save to Database
        knowledge_graph_collection = get_collection("student_knowledge_graph")
        
        entry = StudentKnowledgeGraph(
            student_id=user_id,
            subject=classification.get("subject") or "Unknown",
            chapter=classification.get("chapter"),
            topic=classification.get("topic"),
            micro_concept=classification.get("micro_concept"),
            interaction_type=classification.get("interaction_type") or "Casual",
            query_id=state.get("conversation_id"), # Link to the saved conversation
            conversation_id=state.get("conversation_id"),
            timestamp=datetime.utcnow()
        )
        
        await knowledge_graph_collection.insert_one(entry.model_dump(by_alias=True))
        print("Saved to Student Knowledge Graph")
        
    except Exception as e:
        print(f"Error in chat_to_concept_node: {str(e)}")
        # We do not fail the flow if tagging fails, just log it.
        
    return state
