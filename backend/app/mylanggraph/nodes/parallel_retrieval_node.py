import asyncio
from typing import Dict, Any
from app.mylanggraph.nodes.retriever_node import retrieve_node
from app.mylanggraph.nodes.memory_node import conversation_memory_node

async def parallel_retrieval_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Runs retrieval and memory nodes in parallel and merges their results.
    This ensures the next node waits for BOTH to complete.
    """
    print("---PARALLEL RETRIEVAL START---")
    
    # Create copies of state to avoid race conditions on shared dict if any
    # Although they modify different keys, it's safer.
    # However, since they return the modified state, we need to merge the results.
    
    # Actually, retrieve_node and conversation_memory_node modify state in place AND return it.
    # We can run them concurrently.
    
    # We use asyncio.gather to run them in parallel
    results = await asyncio.gather(
        retrieve_node(state.copy()),
        conversation_memory_node(state.copy())
    )
    
    retrieved_state = results[0]
    memory_state = results[1]
    
    # Merge results back into the main state
    # We prioritize the specific keys they are responsible for
    
    # From retrieve_node
    if "kb_chunks" in retrieved_state:
        state["kb_chunks"] = retrieved_state["kb_chunks"]
    if "retrieved_docs" in retrieved_state:
        state["retrieved_docs"] = retrieved_state["retrieved_docs"]
    if "student_docs" in retrieved_state:
        state["student_docs"] = retrieved_state["student_docs"]
    if "teacher_docs" in retrieved_state:
        state["teacher_docs"] = retrieved_state["teacher_docs"]
    if "error" in retrieved_state and retrieved_state["error"]:
        state["error"] = retrieved_state["error"]

    # From conversation_memory_node
    if "memory_chunks" in memory_state:
        state["memory_chunks"] = memory_state["memory_chunks"]
    if "error" in memory_state and memory_state["error"]:
        # If both have errors, we might overwrite, but usually we just want to know if something failed
        state["error"] = memory_state["error"]
        
    print("---PARALLEL RETRIEVAL DONE---")
    return state
