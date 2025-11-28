# ============================================
# llm_manager.py
# Unified, environment-aware LLM controller
# (Auto-selects OpenAI → Hugging Face → Ollama → Fallback)
# ============================================

from app.prompt.transcription_prompt import TRANSCRIPTION_PROMPT
import os
import base64
from app.prompt.system_prompt import SYSTEM_PROMPT
from dotenv import load_dotenv
import logging
from google import genai
from google.genai import types

# ------------------------------------------------
# Load configuration
# ------------------------------------------------
load_dotenv()
logger = logging.getLogger("assistant-llm")

# Global configs
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.5-flash-lite"
gemini_client = genai.Client(api_key=GEMINI_API_KEY)


# ------------------------------------------------
# Core LLM handler
# ------------------------------------------------
def call_gemini(prompt: str) -> str:
    """
    Unified function to route query based on availability:
    1️⃣ Gemini
    """

    # =======================
    # 1️⃣ Gemini
    # =======================
    try:
        logger.info(f"⚙️ Running Gemini model: {GEMINI_MODEL}")

        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                # response_mime_type="application/json",
            ),
        )
        print(response.text, "--------:::::::::::::::: response gemini")
        return response.text.strip()
    except Exception as e:
        logger.warning(f"⚠️ Gemini failed: {e}")
    
    

def get_mime_type_from_base64(base64_string: str) -> str:
    """Extract MIME type from base64 string prefix."""
    if base64_string.startswith("data:"):
        mime_part = base64_string.split(";")[0]
        return mime_part.replace("data:", "")
    # Default to image/png if no prefix
    return "image/png"

def strip_base64_prefix(base64_string: str) -> str:
    """Remove data URI prefix from base64 string."""
    if "base64," in base64_string:
        return base64_string.split("base64,")[1]
    return base64_string

def gemini_transcribe_image(base64_image: str) -> str:
    """
    Transcribe and explain handwritten notes from an image.
    
    Args:
        base64_image: Base64 encoded image string (with or without data URI prefix)
        
    Returns:
        JSON string containing array of blocks with type, content, and optional box_2d
    """
    try:
        mime_type = get_mime_type_from_base64(base64_image)
        clean_base64 = strip_base64_prefix(base64_image)
        
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=[
                {
                    "parts": [
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": clean_base64
                            }
                        },
                        {"text": "Explain and digitize these notes."}
                    ]
                }
            ],
            config=types.GenerateContentConfig(
                system_instruction=f"{SYSTEM_PROMPT}\n{TRANSCRIPTION_PROMPT}",
                temperature=0.1,
                response_mime_type="application/json",
                response_schema={
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "type": {
                                "type": "STRING",
                                "enum": ["text", "drawing"]
                            },
                            "content": {"type": "STRING"},
                            "box_2d": {
                                "type": "ARRAY",
                                "items": {"type": "INTEGER"}
                            }
                        },
                        "required": ["type", "content"]
                    }
                }
            )
        )
        
        return response.text or "[]"
    except Exception as e:
        logger.error(f"Gemini Transcription Error: {e}")
        raise Exception("Failed to process image. Please try again.")



# currently not being used anywhere. Use it to analyze snippet of an image and test reponse
def analyze_snippet(base64_image: str) -> str:
    """
    Analyze a specific visual snippet (diagram or text) from an image.
    
    Args:
        base64_image: Base64 encoded image string (with or without data URI prefix)
        
    Returns:
        String containing 1-2 sentence explanation of the snippet
    """
    try:
        mime_type = get_mime_type_from_base64(base64_image)
        clean_base64 = strip_base64_prefix(base64_image)
        
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=[
                {
                    "parts": [
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": clean_base64
                            }
                        },
                        {
                            "text": "Explain this specific visual snippet (diagram or text) in 1-2 clear sentences. "
                                   "If it is text, transcribe and explain it. If it is a diagram, describe what it shows."
                        }
                    ]
                }
            ],
            config=types.GenerateContentConfig(
                temperature=0.2
            )
        )
        
        return response.text or ""
    except Exception as e:
        logger.error(f"Gemini Snippet Analysis Error: {e}")
        return "Added from selection"

  