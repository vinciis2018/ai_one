# ============================================
# query.py
# Main RAG endpoint – combines retriever + LLM + logging
# (MongoDB integrated for persistence)
# ============================================
from datetime import datetime
from app.config.db import get_collection
from typing import Optional
from app.mylanggraph.mygraph import process_query_with_lang_graph
from app.core.text_extractor import extract_text_from_image_with_llm

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from dotenv import load_dotenv
import requests
import asyncio
from bson import ObjectId

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
    s3_url: Optional[str] = None
    level: Optional[str] = None
    subject: Optional[str] = None
    reply_context: Optional[str] = None
    selected_document: Optional[str] = None



# ====================================================
# Main RAG Query Endpoints
# ====================================================

@router.post("/query")
async def query(req: QueryRequest):
    """
    Main endpoint for text queries.
    """
    print("request received", req)
    try:

        
        if req.teacher_id == req.userId and req.chatId:
            print("teacher chat")
            previous_conversation_id = ObjectId(req.previousConversation)

            conversation_col = get_collection("conversations")
            await conversation_col.update_one({
                "_id": previous_conversation_id
                }, {
                    "$push": {
                        "comments": {
                            "user_id": req.userId,
                            "comment_text": req.text,
                            "in_reply_to": req.reply_context,
                            "timestamp": datetime.utcnow()
                        }
                    }
                })
            
            result = await conversation_col.find_one({
                "_id": previous_conversation_id
            }, {
                "answer": 1,
                "sources_used": 1,
            })

            return {
                "answer": result.get("answer", ""),
                "sources": result.get("sources_used", []),
                "chat_id": req.chatId,
                "conversation_id": req.previousConversation
            }
            
        
        transcription = None
        if req.s3_url:

            print("s3 url present")
            image_response = requests.get(req.s3_url, timeout=30)
            if image_response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to fetch file from URL. Status: {image_response.status_code}"
                )
        
            contents = image_response.content
            img_bytes = contents

            # Run OCR in executor to avoid blocking
            loop = asyncio.get_running_loop()
            transcription = await loop.run_in_executor(
                None, 
                extract_text_from_image_with_llm, 
                img_bytes
            )
            
            if not transcription or transcription.strip() == "":
                raise HTTPException(
                    status_code=400,
                    detail="Unable to extract text from the image."
                )

        result = await process_query_with_lang_graph(
            query=req.text,
            user_id=req.userId,
            teacher_id=req.teacher_id,
            student_id=req.student_id,
            domain=req.domain_expertise,
            chat_id=req.chatId,
            previous_conversation=req.previousConversation,
            s3_url=req.s3_url,
            chat_space=req.chat_space,
            transcription=transcription,
            to_reply=req.reply_context,
            selected_document_transcript=req.selected_document
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



