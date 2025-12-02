# ============================================
# ai_assistant_lang_graph.py
# LangGraph implementation of your AI Assistant
# ============================================

import stat
from typing import Dict, Any, Optional
from langgraph.graph import StateGraph, END
from datetime import datetime
from bson import ObjectId

from app.core.retriever import retrieve_similar
from app.core.conversation_memory import retrieve_from_conversation_memory
from app.core.llm_manager import call_llm
from app.config.db import get_collection
from app.routers.query_image import analyze_image_with_openai
from app.prompt.prompt_builder import build_prompt
from app.core.save_conversation import _sanitize_sources, _save_conversation

def initial_state(
    query: str,
    user_id: str,
    teacher_id: Optional[str] = None,
    student_id: Optional[str] = None,
    domain: Optional[str] = None,
    chat_id: Optional[str] = None,
    previous_conversation: Optional[str] = None,
    image_url: Optional[str] = None,
) -> Dict[str, Any]:
    """Initialize the state for the LangGraph workflow."""
    return {
        "query": query,
        "user_id": user_id,
        "teacher_id": teacher_id,
        "student_id": student_id,
        "domain": domain or "general",
        "chat_id": chat_id,
        "previous_conversation": previous_conversation,
        "context_chunks": [],
        "memory_chunks": [],
        "prompt": "",
        "answer": "",
        "sources": [],
        "error": None,
        "image_url": image_url,
        "is_image_query": bool(image_url),
    }


# process image with ocr node
async def node_process_image(state: Dict[str, Any]) -> Dict[str, Any]:
    """Process image to extract text using OCR."""
    if state.get("error"):
        return state
        
    try:
        if not state.get("image_url"):
            return state  # Skip if no image
            
        # Extract text from image
        extracted_text = await analyze_image_with_openai(state["image_url"])
        state["query"] = f"{state.get('query', '')} {extracted_text}".strip()
        return state
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        state["error"] = f"Error processing image: {str(e)}"
        return state



# knowledge base node
async def node_retrieve_kb(state: Dict[str, Any]) -> Dict[str, Any]:
    """Retrieve relevant knowledge base context."""
    try:
        user_ids = [state["user_id"]]
        if state.get("teacher_id"):
            teacher_doc = await get_collection("teachers").find_one(
                {"_id": ObjectId(state["teacher_id"])}
            )
            if teacher_doc and "user_id" in teacher_doc:
                user_ids.append(str(teacher_doc["user_id"]))

        context_chunks, user_docs = await retrieve_similar(state["query"], user_ids)
        state["context_chunks"] = context_chunks
        state["sources"] = _sanitize_sources(user_docs)  # Sanitize sources here
    except Exception as e:
        print(f"Error in node_retrieve_kb: {str(e)}")
        state["error"] = f"Error retrieving knowledge base: {str(e)}"
    return state



# conversation memory node
async def node_retrieve_memory(state: Dict[str, Any]) -> Dict[str, Any]:
    """Retrieve conversation history using existing function."""
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
    return state



#  prompt node
def node_build_prompt(state: Dict[str, Any]) -> Dict[str, Any]:
    """Build the prompt using retrieved context."""
    if state.get("is_image_query"):
        # Special handling for image queries
        state["prompt"] = f"""
            The user uploaded an image containing the following text:
            {state['query']}
            
            Please analyze this content and provide a helpful response.
        """
        return state
    
    
    # Mirror prompt construction from routers/query.py
    context_chunks = state.get("context_chunks", [])
    memory_chunks = state.get("memory_chunks", [])
    all_contexts = context_chunks + memory_chunks

    if not all_contexts:
        state["prompt"] = (
            f"Please respond politely to upload relevant docs for reference as no relevant notes found. Respond from general information\n\n"
            f"Question: {state['query']}"
        )
        return state

    doc_context = "\n\n".join(
        f"📘 {chunk['source'].capitalize()} Context:\n{chunk['text']}" for chunk in context_chunks
    )
    conversation_context = "\n\n".join(
        f"💬 Past Conversation ({chunk['created_at']}):\n{chunk['text']}" for chunk in memory_chunks
    )
    context_text = f"{doc_context}\n\n{conversation_context}"

    state["prompt"] = build_prompt(
        user_query=state['query'],
        domain=state['domain'],
        teacher_style="",
        knowledge_base=doc_context,
        conversation_memory=conversation_context,
    )

    # state["prompt"] = f"""
    #     Use the following **knowledge and previous conversation history** to answer clearly.\n\n
        
    #     If part of the answer relates to something we discussed earlier, mention it naturally 
    #     (e.g., "As we talked about before..." or "Building on your earlier question about...").\n\n
    #     Context:\n{context_text}\n\n
    #     Question: {state['query']}
    # """
    return state


# call llm for response node
def node_call_llm(state: Dict[str, Any]) -> Dict[str, Any]:
    """Generate answer using the existing LLM manager."""
    try:
        if state.get("error"):
            return state

        state["answer"] = call_llm(state["prompt"], state["domain"])
    except Exception as e:
        print(f"Error in node_call_llm: {str(e)}")
        state["error"] = f"Error generating answer: {str(e)}"
    return state


# save conversation node
async def node_save_conversation(state: Dict[str, Any]) -> Dict[str, Any]:
    """Save conversation using existing database functions."""
    if state.get("error"):
        return state
        
    try:
        # Get the user's text input if this was an image query
        user_text = state.get("user_text") if state.get("is_image_query") else None
        user_docs = _sanitize_sources(state.get("sources"))
        res = await _save_conversation(
            state["query"],
            state["answer"],
            state.get("chat_id"),
            state.get("previous_conversation"),
            state.get("user_id"),
            state.get("teacher_id"),
            state.get("student_id"),
            user_docs,
            state.get("image_url"),  # attached_media
            state.get("image_transcript"),  # media_transcript
            user_text,  # user_text from image query
            state.get("chat_space"),
            state.get("domain")
        )
        
        # Update state with the saved conversation IDs
        state["chat_id"] = str(res["chat_id"])
        state["conversation_id"] = str(res["conversation_id"])
        
        # Prepare response data
        state["response_data"] = {
            "chat_id": str(res["chat_id"]),
            "conversation_id": str(res["conversation_id"]),
            "previous_conversation": str(state.get("previous_conversation")) if state.get("previous_conversation") else None,
            "query": state["query"],
            "answer": state["answer"],
            "sources_used": len(user_docs),
            "sources": user_docs
        }
        
    except Exception as e:
        print(f"Error in node_save_conversation: {str(e)}")
        state["error"] = f"Error saving conversation: {str(e)}"
    
    return state


# normal query assistant graph
def build_assistant_graph():
    """Build and compile the LangGraph workflow."""
    workflow = StateGraph(dict)

    workflow.add_node("retrieve_kb", node_retrieve_kb)
    workflow.add_node("retrieve_memory", node_retrieve_memory)
    workflow.add_node("build_prompt", node_build_prompt)
    workflow.add_node("call_llm", node_call_llm)
    workflow.add_node("save_conversation", node_save_conversation)

    workflow.add_edge("retrieve_kb", "retrieve_memory")
    workflow.add_edge("retrieve_memory", "build_prompt")
    workflow.add_edge("build_prompt", "call_llm")
    workflow.add_edge("call_llm", "save_conversation")
    workflow.add_edge("save_conversation", END)

    workflow.set_entry_point("retrieve_kb")
    return workflow


# image query assistant graph
def build_file_query_assistant_graph():
    workflow = StateGraph(dict)
    
    workflow.add_node("process_image", node_process_image)
    workflow.add_node("retrieve_kb", node_retrieve_kb)
    workflow.add_node("retrieve_memory", node_retrieve_memory)
    workflow.add_node("build_prompt", node_build_prompt)
    workflow.add_node("call_llm", node_call_llm)
    workflow.add_node("save_conversation", node_save_conversation)

    workflow.add_edge("process_image", "retrieve_kb")
    workflow.add_edge("retrieve_kb", "retrieve_memory")
    workflow.add_edge("retrieve_memory", "build_prompt")
    workflow.add_edge("build_prompt", "call_llm")
    workflow.add_edge("call_llm", "save_conversation")
    workflow.add_edge("save_conversation", END)

    workflow.set_entry_point("process_image")
    return workflow


# Singleton instance
assistant_workflow = build_assistant_graph().compile()
image_workflow = build_file_query_assistant_graph().compile()


async def process_query_with_lang_graph(
    query: str,
    user_id: str,
    teacher_id: Optional[str] = None,
    student_id: Optional[str] = None,
    domain: Optional[str] = None,
    chat_id: Optional[str] = None,
    previous_conversation: Optional[str] = None
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
            previous_conversation=previous_conversation
        )
        
        result = await assistant_workflow.ainvoke(state)
        
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


async def process_image_query_with_lang_graph(
    query: str,
    user_id: str,
    teacher_id: Optional[str] = None,
    student_id: Optional[str] = None,
    domain: Optional[str] = None,
    chat_id: Optional[str] = None,
    previous_conversation: Optional[str] = None,
    image_url: Optional[str] = None
) -> Dict[str, Any]:
    """Process a user image query through the LangGraph workflow."""
    try:
        # Initialize state with image URL
        state = initial_state(
            query=query,
            user_id=user_id,
            teacher_id=teacher_id,
            student_id=student_id,
            domain=domain,
            chat_id=chat_id,
            previous_conversation=previous_conversation,
            image_url=image_url
        )
        
        # Process through image graph
        result = await image_workflow.ainvoke(state)
        
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
        print(f"Error in image query: {str(e)}")
        return {
            "success": False,
            "data": None,
            "error": f"Failed to process image query: {str(e)}"
        }