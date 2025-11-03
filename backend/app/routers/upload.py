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
from app.config.db import get_collection

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

        # Step 2: Chunk text
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
                    "chunk_text": text,  # Store the full text
                    "source_type": source_type,
                    "s3_url": s3_url,
                    "chunk_docs_ids": [doc["_id"] for doc in chunk_docs],
                    "user_id": payload.get("user_id"),
                    "created_at": datetime.utcnow()
                }

                col.insert_one(doc)
                logger.info(f"✅ Successfully saved document to MongoDB")

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

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")





# ====================================================
# List Uploaded Documents
# ====================================================
@router.get("/list")
async def list_uploaded_documents(user_id: str = None):
    """
    Return all uploaded document metadata from MongoDB collections (kb_student, kb_coaching, kb_general).
    Safely serializes ObjectId fields and supports filtering by source_type.
    """
    print(user_id)
    try:
        # Determine collection dynamically
        collection_name = "documents"
        col = get_collection(collection_name)
        print("col", col)
        # Fetch limited fields only
        docs = col.find(
            {"user_id": user_id},
            {"_id": 1, "filename": 1, "source_type": 1, "created_at": 1, "s3_url": 1}
        ).sort("created_at", -1)
        print("docs", docs)
        docs = await docs.to_list()
        print(docs)
        # Safely format results
        documents = []
        for d in docs:
            documents.append({
                "id": str(d.get("_id", "")),  # Convert ObjectId safely
                "filename": d.get("filename", "N/A"),
                "source_type": d.get("source_type", "unknown"),
                "s3_url": d.get("s3_url", None),
                "created_at": (
                    d["created_at"].isoformat() if hasattr(d.get("created_at"), "isoformat")
                    else str(d.get("created_at", "unknown"))
                ),
            })

        return {
            "documents": documents,
            "count": len(documents),
            "collection": collection_name,
        }

    except Exception as e:
        print(f"❌ Error loading documents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load documents: {str(e)}")


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

