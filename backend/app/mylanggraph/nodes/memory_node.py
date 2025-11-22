from app.core.conversation_memory import retrieve_from_conversation_memory

async def conversation_memory_node(state):
    try:
        memory_chunks = await retrieve_from_conversation_memory(
            state["user_id"], state["query"], top_k=3
        )
        state["memory_chunks"] = memory_chunks
    except Exception as e:
        print(f"Error in node_retrieve_memory: {str(e)}")
        state["error"] = f"Error retrieving conversation memory: {str(e)}"
    
    print("memory node done!!!")
    return state
