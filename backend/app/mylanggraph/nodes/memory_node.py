from app.core.conversation_memory import retrieve_from_conversation_memory

async def conversation_memory_node(state):
    try:
        memory_chunks = await retrieve_from_conversation_memory(
            user_id=state["user_id"],
            query_text=state["query"],
            top_k=3,
            domain=state["domain"]
        )
        state["memory_chunks"] = memory_chunks
    except Exception as e:
        print(f"Error in node_retrieve_memory: {str(e)}")
        state["error"] = f"Error retrieving conversation memory: {str(e)}"
    
    print("memory node done!!!")
    return state
