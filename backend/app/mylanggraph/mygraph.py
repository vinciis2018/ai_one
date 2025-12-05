from typing import List, Optional, Dict, Any
from app.mylanggraph.nodes.save_conversation_node import node_save_conversation
from langgraph.graph import StateGraph, END
from app.mylanggraph.mystate import AssistantState
from app.mylanggraph.nodes.ambiguity_node import ambiguity_node
from app.mylanggraph.nodes.parallel_retrieval_node import parallel_retrieval_node
from app.mylanggraph.nodes.final_answer_node import final_answer_node
from app.mylanggraph.nodes.final_answer_node import final_answer_node

def build_graph():
    g = StateGraph(AssistantState)


    g.add_node("ambiguity", ambiguity_node)
    g.add_node("parallel_retrieval", parallel_retrieval_node)
    g.add_node("final", final_answer_node)
    g.add_node("save_conversation", node_save_conversation)

    g.set_entry_point("ambiguity")

    g.add_edge("ambiguity", "parallel_retrieval")
    g.add_edge("parallel_retrieval", "final")
    g.add_edge("final", "save_conversation")
    g.add_edge("save_conversation", END)

    return g.compile()


my_graph_workflow = build_graph()





def initial_state(
    query: str = "",
    user_id: Optional[str] = None,
    teacher_id: Optional[str] = None,
    student_id: Optional[str] = None,
    domain: Optional[str] = None,
    chat_id: Optional[str] = None,
    previous_conversation: Optional[str] = None,
    image_url: Optional[str] = None,
    chat_space: Optional[str] = None,
    image_transcript: Optional[str] = None
) -> Dict[str, Any]:
    """Initialize the state for the LangGraph workflow."""
    return {
        "query": query,
        "user_id": user_id,
        "teacher_id": teacher_id,
        "student_id": student_id,
        "domain": domain or "general",
        "chat_space": chat_space,
        "chat_id": chat_id,
        "previous_conversation": previous_conversation,
        "image_url": image_url,
        "image_transcript": image_transcript,

        "retrieved_docs": [],
        "student_docs": [],
        "teacher_docs": [],
        
        "kb_chunks": [],
        "memory_chunks": [],

        "directive": "",
        "answer": "",

        "error": None,
        "response_data": {}
    }



async def process_query_with_lang_graph(
    query: str,
    user_id: str,
    teacher_id: Optional[str] = None,
    student_id: Optional[str] = None,
    domain: Optional[str] = None,
    chat_id: Optional[str] = None,
    previous_conversation: Optional[str] = None,
    chat_space: Optional[str] = None,
    transcription: Optional[str] = None,
    s3_url: Optional[str] = None
) -> Dict[str, Any]:
    """Process a user query through the LangGraph workflow."""
    try:
        state = initial_state(
            query=query,
            user_id=user_id,
            teacher_id=teacher_id,
            student_id=student_id,
            domain=domain,
            chat_id=chat_id,
            previous_conversation=previous_conversation,
            image_url=s3_url,
            chat_space=chat_space,
            image_transcript=transcription
        )
        
        print("initial_state", state)
        result = await my_graph_workflow.ainvoke(state)
        result = result.get("response_data")
        return {
            "success": "error" not in result or not result["error"],
            "data": {
                "answer": result.get("answer", ""),
                "sources": result.get("sources", []),
                "chat_id": result.get("chat_id"),
                "conversation_id": result.get("conversation_id")
            },
            "error": result.get("error")
        }
    except Exception as e:
        print(f"Error in process_query: {str(e)}")
        return {
            "success": False,
            "data": None,
            "error": f"Failed to process query: {str(e)}"
        }

