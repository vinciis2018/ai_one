from typing import Dict, Any, Optional
from app.core.save_conversation import _sanitize_sources, _save_conversation

# save conversation node
async def node_save_conversation(state: Dict[str, Any]) -> Dict[str, Any]:
    """Save conversation using existing database functions."""
    if state["error"]:
        return state
    try:
        # Get the user's text input if this was an image query
        user_docs = _sanitize_sources(state["retrieved_docs"])
        res = await _save_conversation(
            state["query"],
            state["answer"],
            state["chat_id"],
            state["previous_conversation"],
            state["user_id"],
            state["teacher_id"],
            state["student_id"],
            user_docs,
            state["image_url"],  # attached_media
            state["image_transcript"],  # media_transcript
            None,
            state["chat_space"],
            state["domain"]
        )
        
        # Update state with the saved conversation IDs
        state["chat_id"] = str(res["chat_id"])
        state["conversation_id"] = str(res["conversation_id"])
        
        # Prepare response data
        state["response_data"] = {
            "chat_id": str(res["chat_id"]),
            "conversation_id": str(res["conversation_id"]),
            "previous_conversation": str(state["previous_conversation"]) if state["previous_conversation"] else None,
            "query": state["query"],
            "answer": state["answer"],
            "sources_used": len(user_docs),
            "sources": user_docs
        }
    except Exception as e:
        print(f"Error in node_save_conversation: {str(e)}")
        state["error"] = f"Error saving conversation: {str(e)}"
    
    # Fire-and-forget chat_to_concept
    try:
        from app.mylanggraph.nodes.chat_to_concept_node import chat_to_concept_node
        import asyncio
        # Create a copy of state to avoid mutation issues if any, though chat_to_concept_node mainly reads
        # We pass the current state. Since it's fire-and-forget, the main graph continues.
        asyncio.create_task(chat_to_concept_node(state.copy()))
        print("🚀 Fired chat_to_concept task")
    except Exception as e:
        print(f"Error firing chat_to_concept: {str(e)}")

    print("save conversation node done!!!")
    return state

