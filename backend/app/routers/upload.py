# ============================================
# upload.py
# Handles document upload, OCR, text extraction,
# chunking, embeddings, and MongoDB + FAISS storage
# ============================================

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from PyPDF2 import PdfReader
from PIL import Image
from tqdm import tqdm
import io
import os
import asyncio
from app.core.chunker import chunk_text
from app.core.embeddings import generate_embeddings
from app.core.storage import load_all_metadata, store_embeddings
from app.core.retriever_cache import knowledge_bases
from app.config.settings import UPLOAD_FOLDER
from app.core.text_extractor import extract_text_from_image
from fastapi import APIRouter, HTTPException, Body
import requests
from datetime import datetime
from bson import ObjectId
import logging
from app.config.db import db, get_collection

logger = logging.getLogger(__name__)
router = APIRouter()


# ====================================================
# PDF Text Extraction
# ====================================================
def extract_text_from_pdf(contents: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(contents))
        text = "".join([page.extract_text() or "" for page in reader.pages])
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF processing failed: {str(e)}")


# ====================================================
# Image Text Extraction (DeepSeek OCR)
# ====================================================
def extract_text_from_image(contents: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(contents))
        text = extract_text_from_image(image)
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OCR processing failed: {str(e)}")


# ====================================================
# Save document to knowledge base and db
# ====================================================
async def save_to_kb_db(
    file_name: str,
    text: str,
    source_type: str,
    s3_url: str,
    subject: str,
    domain: str,
    level: str,
    doc_type: str,
    file_type: str,
    file_size: int,
    user_id: str,
    shared_with: list,
    coaching_id: str
):
    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=400, detail="No valid chunks found after text processing.")

    # Step 3: Generate embeddings
    print(f"⚙️ Generating embeddings for {len(chunks)} chunks...")
    embeddings = []
    for chunk in tqdm(chunks, desc="Embedding Batches"):
        emb = generate_embeddings(chunk)
        embeddings.append(emb)

    # Step 4: Store embeddings in FAISS
    print("💾 Storing embeddings in FAISS...")
    chunk_docs = store_embeddings(chunks, embeddings, source_type=source_type)

    # Step 5: Reload relevant knowledge base
    if source_type in knowledge_bases:
        knowledge_bases[source_type].load_data(force=True)
        print(f"⚡ {source_type.capitalize()} knowledge base reloaded after upload.")

    # Step 6: Save to MongoDB in the background
    async def save_to_mongodb():
        try:
            print("Saving to MongoDB...")
            col = get_collection("documents")
            doc_id = ObjectId()  # Generate a new ObjectId for the main document
            print(col)
            print(doc_id)
            # Save document with full text
            doc = {
                "_id": doc_id,  # Use the generated ObjectId
                "filename": file_name,
                "subject": subject,
                "domain": domain,
                "type": doc_type,
                "level": level,
                "file_type": file_type,
                "file_size": file_size,
                "chunk_text": text,  # Store the full text
                "source_type": source_type,
                "s3_url": s3_url,
                "chunk_docs_ids": [doc["_id"] for doc in chunk_docs],
                "user_id": user_id,
                "shared_with": shared_with,
                "created_at": datetime.utcnow()
            }

            col.insert_one(doc)
            logger.info(f"✅ Successfully saved document to MongoDB")

            try:
                # Get the user's role
                user = await db["users"].find_one({"_id": ObjectId(user_id)})
                if not user:
                    logger.warning(f"User {user_id} not found")
                    return
                
                user_role = user.get("role")
                doc_access = {
                    "document_id": doc_id,
                    "access_granted_at": datetime.utcnow(),
                    "can_edit": True  # Users can edit their own documents
                }
                
                if user_role == "student":
                    # Add to student's documents
                    await db["students"].update_one(
                        {"user_id": ObjectId(user_id)},
                        {"$push": {"documents": doc_access}},
                        upsert=True
                    )
                    logger.info(f"✅ Added document to student's documents")
                    
                elif user_role == "teacher":
                    # Add to teacher's documents
                    await db["teachers"].update_one(
                        {"user_id": ObjectId(user_id)},
                        {"$push": {"documents": doc_access}},
                        upsert=True
                    )
                    logger.info(f"✅ Added document to teacher's documents")
                
                # Add to coaching documents if coaching_id is provided
                if coaching_id:
                    await db["organisations"].update_one(
                        {"_id": ObjectId(coaching_id)},
                        {"$addToSet": {"documents": doc_id}},
                        upsert=True
                    )
                    logger.info(f"✅ Added document to coaching {coaching_id}")

            except Exception as e:
                logger.error(f"Error updating user/coaching document references: {str(e)}", exc_info=True)

        except Exception as e:
            logger.error(f"Error saving to MongoDB: {str(e)}", exc_info=True)
            # Consider implementing a retry mechanism here

    # Start the background task
    asyncio.create_task(save_to_mongodb())

    # Return response
    return {
        "filename": file_name,
        "text_preview": text[:500],
        "chunks": len(chunks),
        "embedding_dim": len(embeddings[0]) if embeddings else 0,
        "status": "✅ Processed successfully",
    }

# ====================================================
# Upload Endpoint
# ====================================================
@router.post("/")
async def upload_file(payload: dict = Body(...)):
    """
    Upload and process a document via its S3 URL.
    Extracts text, chunks it, embeds it, stores in MongoDB + FAISS.
    """
    try:
        file_name = payload.get("fileName")
        s3_url = payload.get("s3Url")
        source_type = payload.get("source_type", "student")
        user_id = payload.get("user_id")
        coaching_id = payload.get("coaching_id")
        subject = payload.get("subject")
        domain = payload.get("domain")
        level = payload.get("level")
        doc_type = payload.get("type")
        file_type = payload.get("file_type")
        file_size = payload.get("file_size")
        shared_with = payload.get("shared_with", [])
        text = ""

        if not file_name or not s3_url:
            raise HTTPException(status_code=400, detail="Missing fileName or s3Url in request.")

        print(f"📥 Fetching file from S3: {s3_url}")
        response = requests.get(s3_url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to fetch file from S3: {response.status_code}")

        contents = response.content
        filename_lower = file_name.lower()

        # Step 1: Extract text
        if filename_lower.endswith(".pdf"):
            text = extract_text_from_pdf(contents)
        elif filename_lower.endswith((".png", ".jpg", ".jpeg")):
            text = extract_text_from_image(contents)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a PDF or image.")

        if not text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in file.")

        result = await save_to_kb_db(
            text,
            file_name,
            source_type,
            user_id,
            coaching_id,
            subject,
            domain,
            level,
            doc_type,
            file_type,
            file_size,
            shared_with,
            s3_url
        )

        return result
        # # Step 2: Chunk text
        # chunks = chunk_text(text)
        # if not chunks:
        #     raise HTTPException(status_code=400, detail="No valid chunks found after text processing.")

        # # Step 3: Generate embeddings
        # print(f"⚙️ Generating embeddings for {len(chunks)} chunks...")
        # embeddings = []
        # for chunk in tqdm(chunks, desc="Embedding Batches"):
        #     emb = generate_embeddings(chunk)
        #     embeddings.append(emb)

        # # Step 4: Store embeddings in FAISS
        # print("💾 Storing embeddings in FAISS...")
        # chunk_docs = store_embeddings(chunks, embeddings, source_type=source_type)

        # # Step 5: Reload relevant knowledge base
        # if source_type in knowledge_bases:
        #     knowledge_bases[source_type].load_data(force=True)
        #     print(f"⚡ {source_type.capitalize()} knowledge base reloaded after upload.")

        # # Step 6: Save to MongoDB in the background
        # async def save_to_mongodb():
        #     try:
        #         print("Saving to MongoDB...")
        #         col = get_collection("documents")
        #         doc_id = ObjectId()  # Generate a new ObjectId for the main document
        #         print(col)
        #         print(doc_id)
        #         # Save document with full text
        #         doc = {
        #             "_id": doc_id,  # Use the generated ObjectId
        #             "filename": file_name,
        #             "subject": subject,
        #             "domain": domain,
        #             "type": doc_type,
        #             "level": level,
        #             "file_type": file_type,
        #             "file_size": file_size,
        #             "chunk_text": text,  # Store the full text
        #             "source_type": source_type,
        #             "s3_url": s3_url,
        #             "chunk_docs_ids": [doc["_id"] for doc in chunk_docs],
        #             "user_id": user_id,
        #             "shared_with": shared_with,
        #             "created_at": datetime.utcnow()
        #         }

        #         col.insert_one(doc)
        #         logger.info(f"✅ Successfully saved document to MongoDB")

        #         try:
        #             # Get the user's role
        #             user = await db["users"].find_one({"_id": ObjectId(user_id)})
        #             if not user:
        #                 logger.warning(f"User {user_id} not found")
        #                 return
                    
        #             user_role = user.get("role")
        #             doc_access = {
        #                 "document_id": doc_id,
        #                 "access_granted_at": datetime.utcnow(),
        #                 "can_edit": True  # Users can edit their own documents
        #             }
                    
        #             if user_role == "student":
        #                 # Add to student's documents
        #                 await db["students"].update_one(
        #                     {"user_id": ObjectId(user_id)},
        #                     {"$push": {"documents": doc_access}},
        #                     upsert=True
        #                 )
        #                 logger.info(f"✅ Added document to student's documents")
                        
        #             elif user_role == "teacher":
        #                 # Add to teacher's documents
        #                 await db["teachers"].update_one(
        #                     {"user_id": ObjectId(user_id)},
        #                     {"$push": {"documents": doc_access}},
        #                     upsert=True
        #                 )
        #                 logger.info(f"✅ Added document to teacher's documents")
                    
        #             # Add to coaching documents if coaching_id is provided
        #             if coaching_id:
        #                 await db["organisations"].update_one(
        #                     {"_id": ObjectId(coaching_id)},
        #                     {"$addToSet": {"documents": doc_id}},
        #                     upsert=True
        #                 )
        #                 logger.info(f"✅ Added document to coaching {coaching_id}")

        #         except Exception as e:
        #             logger.error(f"Error updating user/coaching document references: {str(e)}", exc_info=True)

        #     except Exception as e:
        #         logger.error(f"Error saving to MongoDB: {str(e)}", exc_info=True)
        #         # Consider implementing a retry mechanism here
 
        # # Start the background task
        # asyncio.create_task(save_to_mongodb())

        # # Return response
        # return {
        #     "filename": file_name,
        #     "text_preview": text[:500],
        #     "chunks": len(chunks),
        #     "embedding_dim": len(embeddings[0]) if embeddings else 0,
        #     "status": "✅ Processed successfully",
        # }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")





# ====================================================
# List Uploaded Documents
# ====================================================
@router.get("/list")
async def list_uploaded_documents(user_ids: str = None):
    """
    Return all uploaded document metadata from MongoDB for multiple user_ids.
    Accepts comma-separated user_ids and returns documents for all specified users.
    """
    try:
        if not user_ids:
            return {"documents": []}
            
        # Convert comma-separated string to list of ObjectIds
        user_id_list = [uid.strip() for uid in user_ids.split(',') if uid.strip()]
        print(user_id_list)

        # Get the collection
        collection_name = "documents"
        col = get_collection(collection_name)
        
        # Find documents for all user_ids
        cursor = col.find(
            {"user_id": {"$in": user_id_list}},
            {"_id": 1, "filename": 1, "source_type": 1, "created_at": 1, "s3_url": 1, "user_id": 1}
        ).sort("created_at", -1)
        
        # Convert cursor to list and format results
        docs = await cursor.to_list(length=1000)  # Limit to 1000 documents to prevent memory issues
        print(docs)
        
        # Format the response
        documents = []
        for doc in docs:
            doc_dict = {
                "id": str(doc["_id"]),
                "user_id": str(doc["user_id"]),
                "filename": doc.get("filename", ""),
                "source_type": doc.get("source_type", "general"),
                "created_at": doc.get("created_at", ""),
                "s3_url": doc.get("s3_url", "")
            }
            documents.append(doc_dict)
        
        return {"documents": documents}
        
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve documents"
        )



# ====================================================
# Serve Uploaded File
# ====================================================
@router.get("/file/{filename}")
def get_uploaded_file(filename: str):
    """Serve uploaded document file."""
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)


# ====================================================
# Get Document Details
# ====================================================
@router.get("/{doc_id}")
async def get_document_details(doc_id: str):
    """Fetch specific document content from MongoDB."""

    obj_id = ObjectId(doc_id)
 
    col = get_collection("documents")
    doc = await col.find_one({"_id": obj_id})

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "document": {
            "id": str(doc["_id"]),
            "filename": doc.get("filename", "Untitled"),
            "fileUrl": doc.get("s3_url", ""),
            "source_type": doc.get("source_type", "student"),
            "created_at": doc.get("created_at"),
        }
    }

