from app.core.retriever_cache import knowledge_bases
from app.core.storage import store_embeddings
from app.core.embeddings import generate_embeddings
from app.core.chunker import chunk_text

from app.prompt.generate_mcq_prompt import GENERATE_MCQ_PROMPT
from app.prompt.generate_quiz_prompt import GENERATE_QUIZ_PROMPT
from app.prompt.system_prompt import SYSTEM_PROMPT
from app.prompt.generate_notes_prompt import GENERATE_NOTES_PROMPT
from fastapi import APIRouter, HTTPException, status, Body
from pydantic import BaseModel
import requests
import asyncio
import io
from PIL import Image
import fitz  # PyMuPDF
import numpy as np
from app.core.text_extractor import extract_text_with_llm
from app.config.db import db
from bson import ObjectId
from typing import Optional, List, Dict
from app.core.llm_manager import call_llm
import json

from tqdm import tqdm

router = APIRouter()



class TranscriptRequest(BaseModel):
    document_id: str
    page_number: int
    file_url: str

@router.post("/transcribe", status_code=status.HTTP_200_OK)
async def create_transcript_from_image(req: TranscriptRequest):
    """
    Transcribe text from a PDF page or image.
    - If fileUrl is a PDF, extracts the specified page and transcribes it
    - If fileUrl is an image, transcribes the entire image
    - Automatically saves the transcription to the document's notes_description
    """
    try:
        # Validate document_id
        if not ObjectId.is_valid(req.document_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid document ID format"
            )
            
        # Fetch file from URL
        print(f"📥 Fetching file from: {req.file_url}")
        response = requests.get(req.file_url, timeout=30)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to fetch file from URL. Status: {response.status_code}"
            )
        
        contents = response.content
        file_url_lower = req.file_url.lower()
        
        # Determine file type and extract image bytes
        if file_url_lower.endswith(".pdf"):
            # Handle PDF - extract specific page as image
            print(f"📄 Processing PDF page {req.page_number}...")
            
            try:
                doc = fitz.open(stream=contents, filetype="pdf")
                
                # Validate page number
                if req.page_number < 1 or req.page_number > len(doc):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid page number. PDF has {len(doc)} pages."
                    )
                
                # Get the specific page (0-indexed)
                page = doc[req.page_number - 1]
                
                # Convert page to image
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better quality
                img_bytes = pix.tobytes("png")
                
                doc.close()
                
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"PDF processing failed: {str(e)}"
                )
                
        elif file_url_lower.endswith((".png", ".jpg", ".jpeg")):
            # Handle image - use the downloaded content directly
            print(f"🖼️ Processing image...")
            img_bytes = contents
            
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please provide a PDF or image URL."
            )
        
        
        # Extract text using DeepSeek-OCR
        print(f"🔍 Extracting text from {'PDF page' if file_url_lower.endswith('.pdf') else 'image'} using llm..")
        
        # Run OCR in executor to avoid blocking
        loop = asyncio.get_running_loop()
        transcription = await loop.run_in_executor(
            None, 
            extract_text_with_llm, 
            img_bytes
        )
        
        if not transcription or transcription.strip() == "":
            raise HTTPException(
                status_code=400,
                detail="Unable to extract text from the image."
            )
            
        # ---------------------------------------------------------
        # Save transcription to Document
        # ---------------------------------------------------------
        document_id = ObjectId(req.document_id)
        document = await db.documents.find_one({"_id": document_id})
        
        if not document:
             raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
            
        notes_description = document.get("notes_description", [])
        
        # Check if page exists
        page_exists = False
        for i, note in enumerate(notes_description):
            if note.get("page") == req.page_number:
                # Update existing transcription, keep other fields
                notes_description[i]["transcription"] = transcription
                page_exists = True
                break
        
        if not page_exists:
            # Add new entry
            notes_description.append({
                "page": req.page_number,
                "transcription": transcription
            })
            
        # Rebuild chunk_text from all transcriptions to ensure consistency
        all_transcriptions = [note.get("transcription", "") for note in notes_description if note.get("transcription")]
        new_chunk_text = "\n\n".join(all_transcriptions)

        # ---------------------------------------------------------
        # Update Knowledge Base (Embeddings)
        # ---------------------------------------------------------
        if new_chunk_text.strip():
            source_type = document.get("source_type", "teacher")
            collection_name = f"kb_{source_type}"
            
            # 1. Remove old chunks if they exist
            old_chunk_ids = document.get("chunk_docs_ids", [])
            if old_chunk_ids:
                print(f"🗑️ Removing {len(old_chunk_ids)} old chunks from {collection_name}...")
                await db[collection_name].delete_many({"_id": {"$in": old_chunk_ids}})
            
            # 2. Chunk the new text
            chunks = chunk_text(new_chunk_text)
            if chunks:
                # 3. Generate embeddings
                print(f"⚙️ Generating embeddings for {len(chunks)} chunks...")
                embeddings = []
                for chunk in tqdm(chunks, desc="Embedding Batches"):
                    emb = generate_embeddings(chunk)
                    embeddings.append(emb)
                
                # 4. Store new embeddings
                print("💾 Storing embeddings in MongoDB...")
                metadata = {"filename": document.get("filename", "unknown")}
                new_chunk_docs = store_embeddings(chunks, embeddings, source_type=source_type, metadata=metadata)
                
                # Extract new IDs
                new_chunk_ids = [doc["_id"] for doc in new_chunk_docs]
                
                # 5. Reload KB
                if source_type in knowledge_bases:
                    await knowledge_bases[source_type].load_data(force=True)
                    print(f"⚡ {source_type.capitalize()} knowledge base reloaded.")
            else:
                new_chunk_ids = []
        else:
            new_chunk_ids = []

        # Update DB with new chunk_text and chunk_docs_ids
        await db.documents.update_one(
            {"_id": document_id},
            {"$set": {
                "notes_description": notes_description,
                "chunk_text": new_chunk_text,
                "chunk_docs_ids": new_chunk_ids
            }}
        )
        print(f"✅ Auto-saved transcription for page {req.page_number} to document {req.document_id}")
        
        return {
            "status": "success",
            "page_number": req.page_number,
            "file_url": req.file_url,
            "transcription": transcription,
            "saved": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in transcription: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)}"
        )


class GenerateNotesRequest(BaseModel):
    document_id: str
    page_number: int
    domain: str = "general"

@router.post("/generate-notes", status_code=status.HTTP_200_OK)
async def generate_notes(req: GenerateNotesRequest):
    """
    Generate educational notes from transcription using LLM.
    Fetches transcription from document's notes_description and generates structured notes.
    Automatically saves the notes to the document's notes_description.
    """
    try:
        # Validate document_id
        if not ObjectId.is_valid(req.document_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid document ID format"
            )
        
        document_id = ObjectId(req.document_id)
        
        # Fetch document
        document = await db.documents.find_one({"_id": document_id})
        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
            
        # Get transcription for the specified page
        notes_description = document.get("notes_description", [])
        transcription = ""
        
        for note in notes_description:
            if note.get("page") == req.page_number:
                transcription = note.get("transcription", "")
                break
        
        if not transcription:
            raise HTTPException(
                status_code=404,
                detail=f"No transcription found for page {req.page_number}"
            )
            
        # Construct prompt for LLM
        prompt = f"""   
        {SYSTEM_PROMPT} \n
        {GENERATE_NOTES_PROMPT} \n
        Transcription: \n
        {transcription}
        """
        
        # Call LLM
        # Run in executor to avoid blocking
        loop = asyncio.get_running_loop()
        generated_notes = await loop.run_in_executor(
            None, 
            call_llm, 
            prompt
        )
        
        # ---------------------------------------------------------
        # Save notes to Document
        # ---------------------------------------------------------
        # We need to re-fetch or use the existing list, but since we're in async, let's be safe and update
        # Update the specific page's notes in the list we already have (notes_description)
        
        page_updated = False
        for i, note in enumerate(notes_description):
            if note.get("page") == req.page_number:
                notes_description[i]["notes"] = generated_notes
                page_updated = True
                break
        
        if page_updated:
            await db.documents.update_one(
                {"_id": document_id},
                {"$set": {"notes_description": notes_description}}
            )
            print(f"✅ Auto-saved notes for page {req.page_number} to document {req.document_id}")
        else:
            # Page entry does not exist, create a new one with notes (transcription may be empty)
            notes_description.append({
                "page": req.page_number,
                "transcription": "",
                "quiz": {},
                "notes": generated_notes
            })
            await db.documents.update_one(
                {"_id": document_id},
                {"$set": {"notes_description": notes_description}}
            )
            print(f"✅ Created notes entry for page {req.page_number} in document {req.document_id}")
        
        return {
            "status": "success",
            "document_id": req.document_id,
            "page_number": req.page_number,
            "generated_notes": generated_notes,
            "saved": True
        }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating notes: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Note generation failed: {str(e)}"
        )


class QuestionGenerationRequest(BaseModel):
    document_id: str
    page_number: int
    transcription: str
    num_questions: int
    domain: str = "general"

@router.post("/generate-questions", status_code=status.HTTP_200_OK)
async def generate_questions(req: QuestionGenerationRequest):
    """
    Generate questions from transcription using LLM.
    Returns questions categorized by difficulty (easy, medium, hard).
    Automatically saves the questions to the document's notes_description.
    """
    try:
        if not req.transcription:
            raise HTTPException(
                status_code=400,
                detail="Transcription text is required"
            )
            
        # Validate document_id
        if not ObjectId.is_valid(req.document_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid document ID format"
            )
            
        # Construct prompt for LLM
        prompt = f"""
        {SYSTEM_PROMPT} \n
        {GENERATE_QUIZ_PROMPT.format(num_questions=req.num_questions)} \n
        Transcription: \n
        {req.transcription}
        """
        document_id = ObjectId(req.document_id)
        document = await db.documents.find_one({"_id": document_id})
        
        # Call LLM
        # Run in executor to avoid blocking
        loop = asyncio.get_running_loop()
        response_text = await loop.run_in_executor(
            None, 
            call_llm, 
            prompt
        )
        
        # Parse JSON response
        try:
            # Clean response if it contains markdown formatting
            cleaned_response = response_text.replace("```json", "").replace("```", "").strip()
            questions_json = json.loads(cleaned_response)
            
            # ---------------------------------------------------------
            # Save questions (quiz) to Document
            # ---------------------------------------------------------
        
            if document:
                notes_description = document.get("notes_description", [])
                
                # Check if page exists
                page_exists = False
                for i, note in enumerate(notes_description):
                    if note.get("page") == req.page_number:
                        # Update existing entry
                        notes_description[i]["quiz"] = questions_json
                        page_exists = True
                        break
                
                if not page_exists:
                    # Add new entry if page doesn't exist (though it should usually exist from transcription)
                    notes_description.append({
                        "page": req.page_number,
                        "transcription": req.transcription,
                        "quiz": questions_json,
                    })
                    
                # Update DB
                await db.documents.update_one(
                    {"_id": document_id},
                    {"$set": {"notes_description": notes_description}}
                )
                print(f"✅ Auto-saved quiz for page {req.page_number} to document {req.document_id}")
            
            return {
                "status": "success",
                "questions": questions_json,
                "saved": True
            }
        except json.JSONDecodeError:
            print(f"❌ Failed to parse LLM response as JSON: {response_text}")
            # Fallback: try to structure it manually or return raw text if parsing fails completely
            # For now, let's return an error but maybe we could have a retry logic or better parsing
            raise HTTPException(
                status_code=500,
                detail="Failed to generate valid JSON response from LLM"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating questions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Question generation failed: {str(e)}"
        )


class MCQGenerationRequest(BaseModel):
    document_id: str
    page_number: int
    transcription: str
    num_questions: int
    domain: str = "general"

@router.post("/generate-mcq", status_code=status.HTTP_200_OK)
async def generate_mcq(req: MCQGenerationRequest):
    """
    Generate multiple choice questions from transcription using LLM.
    Returns questions categorized by difficulty (easy, medium, hard).
    Each question has 4 options and one correct answer.
    Automatically saves the MCQs to the document's notes_description.
    """
    try:
        if not req.transcription:
            raise HTTPException(
                status_code=400,
                detail="Transcription text is required"
            )
            
        # Validate document_id
        if not ObjectId.is_valid(req.document_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid document ID format"
            )
            
        # Construct prompt for LLM
        prompt = f"""
        {SYSTEM_PROMPT} \n
        {GENERATE_MCQ_PROMPT.format(num_questions=req.num_questions)} \n
        Transcription: \n
        {req.transcription}
        """
        
        document_id = ObjectId(req.document_id)
        document = await db.documents.find_one({"_id": document_id})
        
        # Call LLM
        # Run in executor to avoid blocking
        loop = asyncio.get_running_loop()
        response_text = await loop.run_in_executor(
            None, 
            call_llm, 
            prompt
        )

        # Parse JSON response
        try:
            # Clean response if it contains markdown formatting
            cleaned_response = response_text.replace("```json", "").replace("```", "").strip()
            
            # Check if response appears truncated (doesn't end with })
            if not cleaned_response.rstrip().endswith('}'):
                print(f"⚠️ Warning: Response appears truncated. Last 100 chars: {cleaned_response[-100:]}")
                # Try to fix common truncation issues by closing the JSON
                # Count opening and closing braces to determine what's missing
                open_braces = cleaned_response.count('{')
                close_braces = cleaned_response.count('}')
                open_brackets = cleaned_response.count('[')
                close_brackets = cleaned_response.count(']')
                
                # Add missing closing characters
                if close_brackets < open_brackets:
                    cleaned_response += ']' * (open_brackets - close_brackets)
                if close_braces < open_braces:
                    cleaned_response += '}' * (open_braces - close_braces)
                    
                print(f"🔧 Attempted to fix truncated JSON")
            
            mcq_json = json.loads(cleaned_response)
            
            # ---------------------------------------------------------
            # Save MCQs to Document
            # ---------------------------------------------------------

            if document:
                notes_description = document.get("notes_description", [])
                
                # Check if page exists
                page_exists = False
                for i, note in enumerate(notes_description):
                    if note.get("page") == req.page_number:
                        # Update existing entry
                        notes_description[i]["mcq"] = mcq_json
                        page_exists = True
                        break
                
                if not page_exists:
                    # Add new entry if page doesn't exist
                    notes_description.append({
                        "page": req.page_number,
                        "transcription": req.transcription,
                        "mcq": mcq_json,
                    })
                    
                # Update DB
                await db.documents.update_one(
                    {"_id": document_id},
                    {"$set": {"notes_description": notes_description}}
                )
                print(f"✅ Auto-saved MCQs for page {req.page_number} to document {req.document_id}")
            
            return {
                "status": "success",
                "mcq": mcq_json,
                "saved": True
            }
        except json.JSONDecodeError:
            print(f"❌ Failed to parse LLM response as JSON: {response_text}")
            raise HTTPException(
                status_code=500,
                detail="Failed to generate valid JSON response from LLM"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating MCQs: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"MCQ generation failed: {str(e)}"
        )



class QuickNotesRequest(BaseModel):
    document_id: str

class PersonalTrickRequest(BaseModel):
    document_id: str
    page_number: int
    personal_tricks: Dict

@router.post("/add-personal-tricks", status_code=status.HTTP_200_OK)
async def add_personal_tricks(req: PersonalTrickRequest):
    """
    Add or update personal_tricks for a specific page in a document's notes_description.
    If the page entry does not exist, it will be created with the provided personal_tricks.
    """
    try:
        # Validate document_id
        if not ObjectId.is_valid(req.document_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid document ID format"
            )
        document_id = ObjectId(req.document_id)
        # Fetch document
        document = await db.documents.find_one({"_id": document_id})
        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
        notes_description = document.get("notes_description", [])
        # Find or create page entry
        page_found = False
        for i, note in enumerate(notes_description):
            if note.get("page") == req.page_number:
                notes_description[i]["personal_tricks"] = req.personal_tricks
                page_found = True
                break
        if not page_found:
            notes_description.append({
                "page": req.page_number,
                "personal_tricks": req.personal_tricks
            })
        # Save back to DB
        await db.documents.update_one(
            {"_id": document_id},
            {"$set": {"notes_description": notes_description}}
        )
        print(f"✅ Added personal_tricks for page {req.page_number} in document {req.document_id}")
        return {
            "status": "success",
            "document_id": req.document_id,
            "page_number": req.page_number,
            "saved": True
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error adding personal_tricks: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add personal_tricks: {str(e)}"
        )


class SaveNoteRequest(BaseModel):
    document_id: str
    notes: List[Dict]

@router.post("/save", status_code=status.HTTP_200_OK)
async def save_note_description(req: SaveNoteRequest):
    """
    Save transcription to a document's notes_description field.
    Creates or updates the transcription for a specific page.
    """
    try:
        # Validate document_id
        if not ObjectId.is_valid(req.document_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid document ID format"
            )
        
        document_id = ObjectId(req.document_id)
        
        # Check if document exists
        document = await db.documents.find_one({"_id": document_id})
        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
        
       
        # Update the document
        result = await db.documents.update_one(
            {"_id": document_id},
            {"$set": {"notes_description": req.notes}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=500,
                detail="Failed to save transcription"
            )
        
        print(f"✅ Saved notes for document {req.document_id}")
        
        return {
            "status": "success",
            "message": f"Notes saved for document {req.document_id}",
            "document_id": req.document_id,
            "action": "updated"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error saving transcription: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save transcription: {str(e)}"
        )



########################################
# for complete doc related 
########################################
@router.post("/generate-quick-notes_from_docs", status_code=status.HTTP_200_OK)
async def generate_quick_notes_from_docs(req: QuickNotesRequest):
    """
    Generate quick notes from all transcriptions in a document.
    Fetches all transcriptions from notes_description and generates comprehensive quick notes.
    Saves the quick notes to the document's quick_notes field.
    """
    try:
        # Validate document_id
        if not ObjectId.is_valid(req.document_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid document ID format"
            )
        
        document_id = ObjectId(req.document_id)
        
        # Fetch document
        document = await db.documents.find_one({"_id": document_id})
        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
            
        # Get all transcriptions from notes_description
        notes_description = document.get("notes_description", [])
        
        if not notes_description:
            raise HTTPException(
                status_code=404,
                detail="No transcriptions found in document"
            )
        
        # Collect all transcriptions with their page numbers
        transcriptions = []
        for note in notes_description:
            page = note.get("page")
            transcription = note.get("transcription", "")
            if transcription:
                transcriptions.append({
                    "page": page,
                    "content": transcription
                })
        
        if not transcriptions:
            raise HTTPException(
                status_code=404,
                detail="No transcriptions found in notes_description"
            )
        
        # Combine all transcriptions into a single text
        combined_text = "\n\n".join([
            f"--- Page {t['page']} ---\n{t['content']}" 
            for t in transcriptions
        ])
        
        # Construct prompt for LLM
        prompt = f"""Based on the following transcriptions from multiple pages of a document, generate comprehensive quick notes.

            Transcriptions:
            {combined_text[:8000]}... (truncated if too long)

            Instructions:
            1. Create concise, well-organized quick notes that capture the key concepts from all pages.
            2. Use bullet points and headings to organize the content logically.
            3. Highlight important terms, definitions, formulas, and key takeaways.
            4. Group related concepts together across pages.
            5. Keep the notes clear, educational, and easy to review.
            6. Use markdown formatting for better readability.
            7. Include page references where relevant (e.g., "Page 3: Newton's Laws").

            Generate comprehensive quick notes suitable for quick revision and study.
        """
        
        # Call LLM
        loop = asyncio.get_running_loop()
        quick_notes = await loop.run_in_executor(
            None, 
            call_llm, 
            prompt
        )
        
        # Save quick notes to document
        await db.documents.update_one(
            {"_id": document_id},
            {"$set": {"quick_notes": quick_notes}}
        )
        print(f"✅ Generated and saved quick notes for document {req.document_id}")
        
        return {
            "status": "success",
            "document_id": req.document_id,
            "pages_processed": len(transcriptions),
            "quick_notes": quick_notes,
            "saved": True
        }
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating quick notes: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Quick notes generation failed: {str(e)}"
        )


class QuickQuizRequest(BaseModel):
    document_id: str
    num_questions: int = 5

@router.post("/generate-quick-quiz_from_docs", status_code=status.HTTP_200_OK)
async def generate_quick_quiz_from_docs(req: QuickQuizRequest):
    """
    Generate quick quiz questions from all transcriptions in a document.
    Fetches all transcriptions from notes_description and generates categorized questions.
    Saves the quick quiz to the document's quick_quiz field.
    """
    try:
        # Validate document_id
        if not ObjectId.is_valid(req.document_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid document ID format"
            )
        
        document_id = ObjectId(req.document_id)
        
        # Fetch document
        document = await db.documents.find_one({"_id": document_id})
        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
            
        # Get all transcriptions from notes_description
        notes_description = document.get("notes_description", [])
        
        if not notes_description:
            raise HTTPException(
                status_code=404,
                detail="No transcriptions found in document"
            )
        
        # Collect all transcriptions
        transcriptions = []
        for note in notes_description:
            transcription = note.get("transcription", "")
            if transcription:
                transcriptions.append(transcription)
        
        if not transcriptions:
            raise HTTPException(
                status_code=404,
                detail="No transcriptions found in notes_description"
            )
        
        # Combine all transcriptions
        combined_text = "\n\n".join(transcriptions)
        
        # Construct prompt for LLM
        prompt = f"""Based on the following text from a complete document, generate exactly {req.num_questions * 3} questions.
        
        Text:
        {combined_text[:8000]}... (truncated if too long)
        
        Instructions:
        1. Generate a mix of questions suitable for testing understanding of the entire document.
        2. Categorize them into 'easy', 'medium', and 'hard'.
        3. There should be {req.num_questions} questions for EACH category (total {req.num_questions * 3}).
        4. Each question should be a string.
        
        CRITICAL: Return ONLY a valid JSON object with ALL THREE categories.
        
        Example of correct format:
        {{
            "easy": [
                "What is the capital of France?",
                "What language is spoken in Paris?"
            ],
            "medium": [
                "Which river flows through Paris?",
                "What is the main airport in Paris?"
            ],
            "hard": [
                "In what year was the Eiffel Tower completed?",
                "Who designed the Eiffel Tower?"
            ]
        }}
        
        Do not include any markdown formatting (like ```json) or extra text. Just the raw JSON object.
        Make sure to include all three categories: easy, medium, and hard.
        """
        
        # Call LLM
        loop = asyncio.get_running_loop()
        response_text = await loop.run_in_executor(
            None, 
            call_llm, 
            prompt
        )
        
        # Parse JSON response
        try:
            cleaned_response = response_text.replace("```json", "").replace("```", "").strip()
            quiz_json = json.loads(cleaned_response)
            
            # Save quick quiz to document
            await db.documents.update_one(
                {"_id": document_id},
                {"$set": {"quick_quiz": quiz_json}}
            )
            print(f"✅ Generated and saved quick quiz for document {req.document_id}")
            
            return {
                "status": "success",
                "document_id": req.document_id,
                "pages_processed": len(transcriptions),
                "quick_quiz": quiz_json,
                "saved": True
            }
        except json.JSONDecodeError:
            print(f"❌ Failed to parse LLM response as JSON: {response_text}")
            raise HTTPException(
                status_code=500,
                detail="Failed to generate valid JSON response from LLM"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating quick quiz: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Quick quiz generation failed: {str(e)}"
        )


class QuickMCQRequest(BaseModel):
    document_id: str
    num_questions: int = 3

@router.post("/generate-quick-mcq_from_docs", status_code=status.HTTP_200_OK)
async def generate_quick_mcq_from_docs(req: QuickMCQRequest):
    """
    Generate quick MCQ questions from all transcriptions in a document.
    Fetches all transcriptions from notes_description and generates categorized MCQs.
    Saves the quick MCQ to the document's quick_mcq field.
    """
    try:
        # Validate document_id
        if not ObjectId.is_valid(req.document_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid document ID format"
            )
        
        document_id = ObjectId(req.document_id)
        
        # Fetch document
        document = await db.documents.find_one({"_id": document_id})
        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
            
        # Get all transcriptions from notes_description
        notes_description = document.get("notes_description", [])
        
        if not notes_description:
            raise HTTPException(
                status_code=404,
                detail="No transcriptions found in document"
            )
        
        # Collect all transcriptions
        transcriptions = []
        for note in notes_description:
            transcription = note.get("transcription", "")
            if transcription:
                transcriptions.append(transcription)
        
        if not transcriptions:
            raise HTTPException(
                status_code=404,
                detail="No transcriptions found in notes_description"
            )
        
        # Combine all transcriptions
        combined_text = "\n\n".join(transcriptions)
        
        # Construct prompt for LLM
        prompt = f"""Based on the following text from a complete document, generate exactly {req.num_questions * 3} multiple choice questions.
        
        Text:
        {combined_text[:8000]}... (truncated if too long)
        
        Instructions:
        1. Generate a mix of multiple choice questions suitable for testing understanding of the entire document.
        2. Categorize them into 'easy', 'medium', and 'hard'.
        3. There should be {req.num_questions} questions for EACH category (total {req.num_questions * 3}).
        4. Each question MUST be an OBJECT (not a string) with exactly these fields: "question", "options", "answer", and "explanation".
        5. The "options" field must be an array of exactly 4 strings.
        6. The "answer" field must be one of the options (exact match).
        7. The "explanation" field should explain why the answer is correct.
        
        CRITICAL: Return ONLY a valid JSON object. Each question must be an object, NOT a string.
        
        Example of correct format:
        {{
            "easy": [
                {{
                    "question": "What is the capital of France?",
                    "options": ["London", "Paris", "Berlin", "Madrid"],
                    "answer": "Paris",
                    "explanation": "Paris is the capital and largest city of France."
                }}
            ],
            "medium": [
                {{
                    "question": "Which river flows through Paris?",
                    "options": ["Thames", "Seine", "Rhine", "Danube"],
                    "answer": "Seine",
                    "explanation": "The Seine river flows through the center of Paris."
                }}
            ],
            "hard": [
                {{
                    "question": "In what year was the Eiffel Tower completed?",
                    "options": ["1887", "1889", "1891", "1893"],
                    "answer": "1889",
                    "explanation": "The Eiffel Tower was completed in 1889 for the World's Fair."
                }}
            ]
        }}
        
        DO NOT include any markdown formatting (like ``` and/or ```json) or extra text.
        Just the raw JSON object.
        """
        
        # Call LLM
        loop = asyncio.get_running_loop()
        response_text = await loop.run_in_executor(
            None, 
            call_llm, 
            prompt
        )
        
        # Parse JSON response
        try:
            cleaned_response = response_text.replace("```json", "").replace("```", "").strip()
            # Check if response appears truncated
            if not cleaned_response.rstrip().endswith('}'):
                print(f"⚠️ Warning: Response appears truncated. Last 100 chars: {cleaned_response[-100:]}")
                open_braces = cleaned_response.count('{')
                close_braces = cleaned_response.count('}')
                open_brackets = cleaned_response.count('[')
                close_brackets = cleaned_response.count(']')
                
                if close_brackets < open_brackets:
                    cleaned_response += ']' * (open_brackets - close_brackets)
                if close_braces < open_braces:
                    cleaned_response += '}' * (open_braces - close_braces)
                    
                print(f"🔧 Attempted to fix truncated JSON")
            
            mcq_json = json.loads(cleaned_response)
            
            # Save quick MCQ to document
            await db.documents.update_one(
                {"_id": document_id},
                {"$set": {"quick_mcq": mcq_json}}
            )
            print(f"✅ Generated and saved quick MCQ for document {req.document_id}")
            
            return {
                "status": "success",
                "document_id": req.document_id,
                "pages_processed": len(transcriptions),
                "quick_mcq": mcq_json,
                "saved": True
            }
        except json.JSONDecodeError:
            print(f"❌ Failed to parse LLM response as JSON: {response_text}")
            raise HTTPException(
                status_code=500,
                detail="Failed to generate valid JSON response from LLM"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating quick MCQ: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Quick MCQ generation failed: {str(e)}"
        )

