# ============================================
# query.py
# Main RAG endpoint – combines retriever + LLM + logging
# (MongoDB integrated for persistence)
# ============================================

from tqdm import tqdm
from app.routers.upload import save_to_kb_db
from app.core.retriever_cache import embedder
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import os
import yaml
import base64
from dotenv import load_dotenv
from datetime import datetime
from bson import ObjectId
from app.core.retriever import retrieve_similar
from app.core.logger_middleware import log_query_event
from app.core.llm_manager import call_llm, open_ai_client
from app.config.db import db, get_collection
from app.config.settings import BASE_DIR
from typing import Optional, List, Dict, Any
from app.core.conversation_memory import retrieve_from_conversation_memory
import easyocr
import cv2
import numpy as np
import io
import requests
from PIL import Image
from app.core.chunker import chunk_text

# ====================================================
# Load config and environment
# ====================================================

load_dotenv()

CONFIG_FILE = BASE_DIR / "config.yaml"
with open(CONFIG_FILE, "r") as f:
    CONFIG = yaml.safe_load(f)

MODEL_NAME = CONFIG["model"]["name"]
TEMP = CONFIG["model"]["temperature"]
MAX_TOKENS = CONFIG["model"]["max_completion_tokens"]
FALLBACK_ANSWER = CONFIG["fallback"]["offline_response"]

router = APIRouter()

# ====================================================
# Initialize EasyOCR Reader (Lightweight for 1GB RAM)
# ====================================================

# Initialize EasyOCR Reader with better error handling
def initialize_ocr():
    try:
        reader = easyocr.Reader(
            ['en'], 
            gpu=False,
            download_enabled=True,
            model_storage_directory='./easyocr_models'
        )
        print("✅ EasyOCR initialized successfully")
        return reader
    except Exception as e:
        print(f"❌ EasyOCR initialization failed: {e}")
        return None

# ocr_reader = initialize_ocr()


# ====================================================
# Request Schemas
# ====================================================

class QueryRequest(BaseModel):
    text: str
    userId: str
    teacher_id: Optional[str] = None
    student_id: Optional[str] = None
    chatId: str
    previousConversation: str
    domain_expertise: str

class ImageQueryRequest(BaseModel):
    text: Optional[str] = None
    fileName: str
    s3Url: str
    userId: str
    teacher_id: Optional[str] = None
    student_id: Optional[str] = None
    chatId: str
    previousConversation: str
    domain_expertise: str
    file_type: str
    file_size: Optional[int] = None
    source_type: str
    subject: Optional[str] = None
    domain: Optional[str] = None
    level: Optional[str] = None
    coaching_id: Optional[str] = None
    shared_with: Optional[list] = None
    type: Optional[str] = "image_query"

# ====================================================
# Image Processing & OCR Functions
# ====================================================

# def preprocess_image_for_ocr(image_bytes: bytes) -> np.ndarray:
#     """Preprocess image for better OCR accuracy"""
#     try:
#         # Convert bytes to numpy array
#         image = Image.open(io.BytesIO(image_bytes))
#         img_array = np.array(image)
        
#         # Convert to RGB if needed
#         if len(img_array.shape) == 3 and img_array.shape[2] == 3:
#             img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
#         # Resize if image is too large (memory optimization)
#         height, width = img_array.shape[:2]
#         if height > 1200 or width > 1200:
#             scale = min(1200/height, 1200/width)
#             new_width = int(width * scale)
#             new_height = int(height * scale)
#             img_array = cv2.resize(img_array, (new_width, new_height))
        
#         # Convert to grayscale
#         if len(img_array.shape) == 3:
#             gray = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
#         else:
#             gray = img_array
        
#         # Apply simple thresholding
#         _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
#         return thresh
        
#     except Exception as e:
#         print(f"Error in image preprocessing: {e}")
#         # Return original image if preprocessing fails
#         return np.array(Image.open(io.BytesIO(image_bytes)))



def analyze_image_with_openai(
    image_bytes: bytes,
    prompt: str,
    max_tokens: int = 250,
    model: str = "gpt-4o-mini"
) -> str:
    """
    Analyze an image using OpenAI's Vision API.
    
    Args:
        image_bytes: The image file as bytes
        prompt: The prompt/context for the image analysis
        max_tokens: Maximum number of tokens in the response
        model: The OpenAI model to use
        
    Returns:
        str: The model's analysis of the image
    """
    try:
        # Convert image to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        # Prepare the messages for the API
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}",
                            "detail": "high"
                        }
                    }
                ]
            }
        ]
        
        # Call the API
        response = open_ai_client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens
        )


        
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"❌ OpenAI Vision API error: {str(e)}")
        # Fall back to OCR if Vision API fails
        print("Falling back to OCR... (work in progress, don't expect correct response)")
        # return extract_text_from_image(image_bytes)
        return e

# def extract_text_from_image(image_bytes: bytes) -> str:
#     """Extract text from image using EasyOCR with robust error handling"""
#     if ocr_reader is None:
#         raise HTTPException(status_code=500, detail="OCR engine not available")
    
#     try:
#         # Convert bytes to PIL Image
#         image = Image.open(io.BytesIO(image_bytes))
        
#         # Convert to numpy array
#         img_array = np.array(image)
        
#         # Handle different image formats
#         if len(img_array.shape) == 3:
#             if img_array.shape[2] == 4:  # RGBA
#                 # Convert RGBA to RGB
#                 img_array = cv2.cvtColor(img_array, cv2.COLOR_RGBA2RGB)
#             # Convert RGB to BGR for OpenCV
#             img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
#         else:
#             # Grayscale image
#             img_array = cv2.cvtColor(img_array, cv2.COLOR_GRAY2BGR)
        
#         # Resize if too large (memory optimization)
#         height, width = img_array.shape[:2]
#         max_dimension = 1600
#         if height > max_dimension or width > max_dimension:
#             scale = min(max_dimension/height, max_dimension/width)
#             new_width = int(width * scale)
#             new_height = int(height * scale)
#             img_array = cv2.resize(img_array, (new_width, new_height))
#             print(f"🔄 Resized image from {width}x{height} to {new_width}x{new_height}")
        
#         # Perform OCR with error handling
#         results = ocr_reader.readtext(
#             img_array,
#             batch_size=1,
#             paragraph=True,
#             min_size=20,
#             text_threshold=0.5,
#             link_threshold=0.4,
#             width_ths=0.5
#         )
        
#         # Extract and combine text
#         extracted_text = []
#         for (bbox, text, confidence) in results:
#             if confidence > 0.4:
#                 extracted_text.append(text)
#                 print(f"📝 Detected: '{text}' (confidence: {confidence:.2f})")
        
#         combined_text = " ".join(extracted_text).strip()
        
#         print(f"✅ Extracted {len(extracted_text)} text blocks from image")
#         return combined_text
        
#     except Exception as e:
#         print(f"❌ OCR extraction failed: {e}")
#         raise HTTPException(status_code=500, detail="Failed to extract text from image")


# ====================================================
# Common Query Processing Function
# ====================================================

async def process_query_common(
    user_query: str,
    user_id: str,
    chat_id: str,
    teacher_id: Optional[str],
    student_id: Optional[str],
    previous_conversation: str,
    domain_expertise: str,
    attached_media: Optional[str] = None,
    media_transcript: Optional[str] = None,
    user_text: Optional[str] = None,
    chat_space: Optional[str] = None
):
    """Common processing logic for both text and image queries"""
    try:
        user_ids = [user_id]

        if teacher_id:
            teacher = await db["teachers"].find_one({"_id": ObjectId(teacher_id)})
            if teacher and "user_id" in teacher:
                teacher_user_id = str(teacher["user_id"])
                print("teacher", teacher_user_id)
                user_ids.append(teacher_user_id)

        if not user_query:
            raise HTTPException(status_code=400, detail="Query text cannot be empty.")

        # Step 1: Retrieve from knowledge bases
        context_chunks, user_docs = await retrieve_similar(user_query, user_ids)

        # Step 2: Retrieve from user's conversation history
        memory_chunks = await retrieve_from_conversation_memory(user_id, user_query, top_k=3)

        # Combine results
        all_contexts = context_chunks + memory_chunks

        # Convert any ObjectIds in user_docs to strings
        user_docs = _sanitize_sources(user_docs)
        
        if not all_contexts:
            print("⚠️ No relevant chunks found. Returning fallback.")
            augmented_prompt = (
                f"No relevant notes found. Please respond politely to upload relevant docs for reference and respond from available information\n\n"
                f"Question: {user_query}"
            )

            answer = call_llm(augmented_prompt, domain_expertise)
            log_query_event(user_query, answer, success=False)
            res = await _save_conversation(
                user_query,
                answer,
                chat_id,
                previous_conversation,
                user_id,
                teacher_id,
                student_id,
                user_docs,
                attached_media,
                media_transcript,
                user_text,
                chat_space
            )
            
            return {
                "chat_id": res["chat_id"],
                "conversation_id": res["conversation_id"],
                "previous_conversation": str(previous_conversation) if previous_conversation else None,
                "query": user_query,
                "answer": answer,
                "sources_used": len(user_docs), 
                "sources": user_docs,
                "is_ocr_query": False,
            }

        # Step 2: Build augmented prompt
        context_text = "\n\n".join(chunk['text'] for chunk in all_contexts)

        augmented_prompt = (
            f"Answer the following question using ONLY the context below.\n\n"
            f"Context:\n{context_text}\n\n"
            f"Question: {user_query}"
        )

        # Step 3: Get answer (OpenAI or local fallback)
        answer = call_llm(augmented_prompt, domain_expertise)

        # Step 4: Log + save
        log_query_event(user_query, answer)
        res = await _save_conversation(
            user_query,
            answer,
            chat_id,
            previous_conversation,
            user_id,
            teacher_id,
            student_id,
            user_docs,
            attached_media,
            media_transcript,
            user_text,
            chat_space
        )
        
        return {
            "chat_id": res["chat_id"],
            "conversation_id": res["conversation_id"],
            "previous_conversation": str(previous_conversation) if previous_conversation else None,
            "query": user_query, 
            "answer": answer, 
            "sources_used": len(user_docs), 
            "sources": user_docs,
            "is_ocr_query": False
        }

    except Exception as e:
        print(f"Error processing query: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing your request: {str(e)}"
        )



# ====================================================
# Main RAG Query Endpoints
# ====================================================

@router.post("/query")
async def query(req: QueryRequest):
    """
    Main endpoint for text queries.
    """
    return await process_query_common(
        user_query=req.text.strip(),
        user_id=req.userId,
        chat_id=req.chatId,
        teacher_id= req.teacher_id,
        student_id= req.student_id,
        previous_conversation=req.previousConversation,
        domain_expertise=req.domain_expertise,
        user_text=req.text.strip()
    )


@router.post("/query-image")  # Using the endpoint your frontend is calling
async def image_query(req: ImageQueryRequest):
    """
    Endpoint for image-based queries.
    Extracts text from image and processes it as a query.
    """
    try:

        print(f"📸 Processing image query from S3: {req.fileName}")
        print(f"🔗 S3 URL: {req.s3Url}")
        
        # Step 1: Download image from S3 using requests
        print("⬇️ Downloading image from S3...")
        response = requests.get(req.s3Url, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Failed to download from S3. Status: {response.status_code}")
            raise HTTPException(
                status_code=400, 
                detail=f"Failed to download image from S3. Status: {response.status_code}"
            )

        # Get the image content
        image_bytes = response.content
        
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image downloaded from S3")
        
        print(f"✅ Downloaded {len(image_bytes)} bytes from S3")
        
        # Prepare the prompt with context
        context = (
            "You are a helpful visual assistant that analyzes images. "
            "The image contains hand written notes, please transcribe it accurately as shown in the image. "
        )
        
        if req.domain_expertise:
            if req.text:
              context += f"\n\nAnswer the following query after analysing the content of the image: {req.text.strip()} "

            context += f"\n\nAdditional context: This is related to {req.domain_expertise}. "
            context += "Please find any question that is present in the image that would be helpful for someone who is seeking help for his competitive exams preparation from his hand written notes."
            context += "Keep it short and precise."
        
        # Analyze the image using OpenAI Vision API
        image_analysis_text = analyze_image_with_openai(
            image_bytes=image_bytes,
            prompt=context,
            max_tokens=250
        )

        analysis = (
            f"\n\n{req.text.strip()} \n\n"
            "The above query in reference to an uploaded image, whose transcription is provided below. Answer the query with respect to the image using the below provided transcription . "
            f"\n\n{image_analysis_text} \n\n"
        )


        print("analysis: ", analysis)
        resr = await save_to_kb_db(
          file_name = req.fileName,
          s3_url = req.s3Url,
          source_type = req.source_type,
          user_id = req.userId,
          coaching_id = req.coaching_id or None,
          subject = req.subject,
          domain = req.domain,
          level = req.level,
          doc_type = req.type,
          file_type = req.file_type,
          file_size = req.file_size,
          shared_with = req.shared_with or [],
          text = analysis
        )

        print("✅ Document saved to knowledge base and MongoDB", resr)
        # Process the analysis as a regular query
        result = await process_query_common(
            user_query=analysis,
            user_id=req.userId,
            teacher_id=req.teacher_id,
            student_id=req.student_id,
            chat_id=req.chatId,
            previous_conversation=req.previousConversation,
            domain_expertise=req.domain_expertise,
            attached_media=req.s3Url,
            media_transcript=image_analysis_text,
            user_text=req.text.strip()
        )
        
        # Add image analysis metadata to the response
        result.update({
            "is_image_query": True,
            "original_image": req.fileName,
            "analysis_preview": analysis
        })
        
        return result
        
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error processing image query: {error_msg}")
        # Return a simple error message to avoid encoding issues
        # Ensure we're not trying to serialize binary data
        if isinstance(e, UnicodeDecodeError):
            error_msg = "Error: Could not process the image content. The file may be corrupted or in an unsupported format."
        raise HTTPException(
            status_code=500,
            detail=error_msg if len(error_msg) < 100 else "Error processing image query. Please try again with a different image."
        )


# ====================================================
# Helper: Sanitize sources to remove ObjectIds
# ====================================================

def _sanitize_sources(sources):
    """
    Recursively convert ObjectId instances to strings in the sources list.
    """
    if isinstance(sources, list):
        return [_sanitize_sources(item) for item in sources]
    elif isinstance(sources, dict):
        return {k: _sanitize_sources(v) for k, v in sources.items()}
    elif isinstance(sources, ObjectId):
        return str(sources)
    elif isinstance(sources, datetime):
        return sources.isoformat() + "Z"
    else:
        return sources

# ====================================================
# Helper: Save conversation to MongoDB
# ====================================================

async def _save_conversation(
    query: str,
    answer: str,
    chat_id: Optional[str] = None,
    previous_conversation: Optional[str] = None,
    user_id: Optional[str] = None,
    teacher_id: Optional[str] = None,
    student_id: Optional[str] = None,
    user_docs: Optional[list] = None,
    attached_media: Optional[str] = None,
    media_transcript: Optional[str] = None,
    user_text: Optional[str] = None,
    chat_space: Optional[str] = None
) -> dict:
    """
    Save or update chat and conversation in MongoDB.
    - If chat_id is provided, adds the new conversation to the existing chat
    - If no chat_id, creates a new chat with the conversation
    Returns only the essential IDs, not the full documents.
    """
    try:

        chat_collection = get_collection("chats")
        conversation_collection = get_collection("conversations")
        
        # Create conversation document
        now = datetime.utcnow()
        conversation = {
            "query": user_text if user_text else query,
            "answer": answer,
            "query_by": "user",
            "answer_by": "assistant",
            "prev_conversation": previous_conversation,
            "parent_chat": chat_id,
            "sources_used": [str(doc["_id"]) if "_id" in doc else str(doc["conversation_id"]) for doc in user_docs],
            "created_at": now,
            "updated_at": now,
            "edit_history": [],
            "attached_media": attached_media,
            "media_transcript": media_transcript
        }
        

        # Insert conversation
        conversation_result = await conversation_collection.insert_one(conversation.copy())
        conversation_id = str(conversation_result.inserted_id)
        
        if chat_id:
            # For existing chat, just add the new conversation reference
            chat_id_obj = ObjectId(chat_id)
            
            # Check if this conversation already exists in the chat
            existing_conv = await chat_collection.find_one({
                "_id": chat_id_obj,
                "conversations.conversation_id": conversation_id
            })
            
            if not existing_conv:
                # Only add the conversation if it doesn't already exist
                pseudo_conversation = {
                    "conversation_id": conversation_id,
                    "prev_conversation": previous_conversation,
                    "parent_chat": chat_id,
                    "created_at": now,
                    "updated_at": now
                }
                
                await chat_collection.update_one(
                    {"_id": chat_id_obj},
                    {
                        "$push": {
                            "conversations": pseudo_conversation,
                        },
                        "$set": {
                            "updated_at": now,
                            # "title": query[:100]  # Update title with latest query (truncated)
                        }
                    }
                )
        else:
            # Create new chat with the conversation
            if not user_id:
                raise ValueError("user_id is required when creating a new chat")
                
            chat_doc = {
                "title": query[:100],
                "user_id": user_id,
                "teacher_id": teacher_id,
                "student_id": student_id,
                "chat_space": chat_space,
                "conversations": [{
                    "conversation_id": conversation_id,
                    "prev_conversation": previous_conversation,
                    "parent_chat": None,  # Will be updated after insert
                    "created_at": now,
                    "updated_at": now
                }],
                "created_at": now,
                "updated_at": now
            }
            
            # Insert new chat
            result = await chat_collection.insert_one(chat_doc)
            chat_id = str(result.inserted_id)

            
            # Update the parent_chat reference
            await chat_collection.update_one(
                {"_id": result.inserted_id, "conversations.conversation_id": conversation_id},
                {"$set": {
                    "conversations.$.parent_chat": chat_id,
                    

                }}
            )

            # update chat_id in conversation
            await conversation_collection.update_one(
                {"_id": conversation_id},
                {"$set": {"parent_chat": chat_id}}
            )

        
        embedding = embedder.encode(f"{query} {answer}").astype("float32").tolist()
        await conversation_collection.update_one(
            {"_id": conversation_result.inserted_id},
            {"$set": {"embedding": embedding, "user_id": user_id}}
        )
        
        return {
            "chat_id": chat_id,
            "conversation_id": conversation_id
        }
        
    except Exception as e:
        print(f"⚠️ Failed to save conversation: {e}")
        raise

