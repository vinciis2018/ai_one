# ============================================
# query.py
# Main RAG endpoint – combines retriever + LLM + logging
# (MongoDB integrated for persistence)
# ============================================
from typing import Optional
from app.core.ai_assistant_lang_graph import process_image_query_with_lang_graph
from app.mylanggraph.mygraph import process_query_with_lang_graph

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from dotenv import load_dotenv


# ====================================================
# Load config and environment
# ====================================================

load_dotenv()

router = APIRouter()

# ====================================================
# Request Schemas
# ====================================================

class QueryRequest(BaseModel):
    text: str
    userId: str
    teacher_id: Optional[str] = None
    student_id: Optional[str] = None
    chatId: Optional[str]
    previousConversation: Optional[str]
    domain_expertise: Optional[str]
    chat_space: Optional[str] = None


class ImageQueryRequest(BaseModel):
    text: Optional[str] = None
    fileName: str
    s3Url: str
    userId: str
    teacher_id: Optional[str] = None
    student_id: Optional[str] = None
    chatId: Optional[str]
    previousConversation: Optional[str]
    domain_expertise: Optional[str]
    file_type: str
    file_size: Optional[int] = None
    source_type: str
    subject: Optional[str] = None
    domain: Optional[str] = None
    level: Optional[str] = None
    coaching_id: Optional[str] = None
    shared_with: Optional[list] = None
    type: Optional[str] = "image_query"
    chat_space: Optional[str] = None

# ====================================================
# Main RAG Query Endpoints
# ====================================================

@router.post("/query")
async def query(req: QueryRequest):
    """
    Main endpoint for text queries.
    """
    print("request", req)
    try:
        result = await process_query_with_lang_graph(
            query=req.text,
            user_id=req.userId,
            teacher_id=req.teacher_id,
            student_id=req.student_id,
            domain=req.domain_expertise,
            chat_id=req.chatId,
            previous_conversation=req.previousConversation,
            chat_space=req.chat_space
        )

        # print(result, "::::: -> result here")
        return result["data"]
    except Exception as e:
        print(f"Error in query: {str(e)}")
        return {
            "success": False,
            "data": None,
            "error": f"Failed to process query: {str(e)}"
        }




@router.post("/query-image")
async def image_query(req: ImageQueryRequest):
    try:
        
        result = await process_image_query_with_lang_graph(
          query=req.text,
          user_id=req.userId,
          teacher_id=req.teacher_id,
          student_id=req.student_id,
          domain=req.domain_expertise,
          chat_id=req.chatId,
          previous_conversation=req.previousConversation,
          image_url=req.s3Url
        )
        
        return result["data"]
        
    except Exception as e:
        print(f"Error in image query: {str(e)}")
        return {
            "success": False,
            "data": None,
            "error": f"Failed to process image query: {str(e)}"
        }