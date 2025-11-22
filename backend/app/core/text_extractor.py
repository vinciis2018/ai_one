# ============================================
# text_extractor.py
# Handles text extraction from PDFs and images
# ============================================

from app.core.llm_manager import OPENAI_API_KEY
import io
from PIL import Image
import fitz  # PyMuPDF
import pytesseract
import re
import numpy as np
import easyocr
import os
import base64
from openai import OpenAI

# ====================================================
# Extract text from PDF
# ====================================================

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts text from a PDF file (bytes input).
    Uses PyMuPDF for reliable text extraction.
    """
    text = ""
    try:
        with fitz.open(stream=pdf_bytes, filetype="pdf") as pdf:
            for page in pdf:
                page_text = page.get_text("text")
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"❌ PDF text extraction failed: {e}")
        return ""

    return text.strip()


# ====================================================
# Extract text from image
# ====================================================

def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Extracts text from image using Tesseract OCR.
    Supports PNG, JPG, and JPEG.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        print(f"❌ OCR extraction failed: {e}")
        return ""


# ====================================================
# Extract text using llm
# ====================================================

def extract_text_with_llm(image_bytes: bytes) -> str:
    """
    Extracts text from image using OpenAI Vision API (best accuracy).
    Falls back to EasyOCR if OpenAI is unavailable.
    Better for handwritten notes and complex documents.
    """

    
    # Try OpenAI Vision API first (best quality)
    try:
        
        if not OPENAI_API_KEY:
            print("⚠️ OPENAI_API_KEY not found, falling back to EasyOCR")
            raise ValueError("No OpenAI API key")
        
        print("🔍 Using OpenAI Vision API for text extraction...")
        
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        # Convert image to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        # Call OpenAI Vision API with optimized prompt for OCR and diagram detection
        response = client.chat.completions.create(
            model="gpt-5-nano",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """Please analyze this image and provide a comprehensive transcription including text and diagrams.

**Instructions:**

1. **Text Transcription:**
   - Extract every word, number, and symbol exactly as shown
   - Preserve the layout and structure (headings, paragraphs, lists)
   - Include handwritten notes and equations
   - If text is unclear, make your best interpretation

2. **Diagram Detection:**
   - Identify any diagrams, charts, graphs, or visual elements
   - For each diagram, provide a detailed description in this format:
   
   ```
   [DIAGRAM: <type>]
   Title: <diagram title if any>
   Description: <detailed description of what the diagram shows>
   Components: <list key components, labels, arrows, relationships>
   Notes: <any additional important details>
   [/DIAGRAM]
   ```

3. **Mathematical Equations:**
   - Write equations clearly using standard notation
   - Use LaTeX format for complex equations (e.g., $E = mc^2$)

4. **Output Format:**
   - Use markdown formatting
   - Separate sections with headers (## for main sections)
   - Use bullet points for lists
   - Keep diagrams in the structured format above so they can be edited

**Example Output:**

## Transcription

[Main text content here...]

## Diagrams

[DIAGRAM: Flowchart]
Title: Chemical Bonding Process
Description: Shows the process of ionic bond formation between sodium and chlorine atoms
Components: 
- Sodium atom (Na) with 1 valence electron
- Chlorine atom (Cl) with 7 valence electrons
- Arrow showing electron transfer
- Resulting Na+ and Cl- ions
Notes: Demonstrates electron transfer and electrostatic attraction
[/DIAGRAM]

## Equations

$NaCl \\rightarrow Na^+ + Cl^-$

Provide the complete transcription below:"""
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                                "detail": "high"
                            }
                        }
                    ]
                }
            ],
            max_completion_tokens=8000  # Increased for GPT-5-nano (reasoning + output tokens)
        )
        
        
        # GPT-5-nano may use reasoning tokens, check for content
        text = response.choices[0].message.content
        
        if text and text.strip():
            print(f"✅ OpenAI Vision extracted {len(text)} characters")
            return text.strip()
        else:
            print(f"⚠️ OpenAI Vision returned empty content. Finish reason: {response.choices[0].finish_reason}")
            print(f"   Reasoning tokens: {response.usage.completion_tokens_details.reasoning_tokens}")
            print("   Falling back to EasyOCR")
            raise ValueError("Empty response from OpenAI Vision")
            
    except Exception as e:
        print(f"⚠️ OpenAI Vision failed: {e}")
        print("Falling back to EasyOCR...")
        
        # Fallback to EasyOCR
        try:
            import easyocr
            import numpy as np
            from PIL import Image
            
            print("🔍 Using EasyOCR for text extraction...")
            
            # Initialize EasyOCR reader
            reader = easyocr.Reader(['en'], gpu=False)
            
            # Open image and convert to numpy array
            image = Image.open(io.BytesIO(image_bytes))
            img_np = np.array(image)
            
            # Extract text with detail=0 to avoid unpacking errors
            results = reader.readtext(img_np, detail=0, paragraph=True)
            
            # Results is now a simple list of strings
            if results:
                full_text = "\n".join(results)
                print(f"✅ EasyOCR extracted {len(full_text)} characters")
                return full_text.strip()
            else:
                print("⚠️ EasyOCR returned empty, falling back to Tesseract")
                return extract_text_from_image(image_bytes)
                
        except Exception as ocr_error:
            print(f"❌ EasyOCR also failed: {ocr_error}")
            print("Final fallback to Tesseract OCR...")
            return extract_text_from_image(image_bytes)




def fix_broken_words(text: str) -> str:
    # Remove single-character gaps inside words: "f requency" → "frequency"
    text = re.sub(r"(?<=\w)\s+(?=\w)", " ", text)

    # Fix cases where a space appears inside a known pattern like:
    # "M agnetic" -> "Magnetic", "T orque" -> "Torque"
    text = re.sub(r"([A-Za-z])\s+([A-Za-z])", r"\1\2", text)

    return text

def restore_word_boundaries(text: str) -> str:
    # Put back spaces before capital letters: "MagneticField" → "Magnetic Field"
    text = re.sub(r"([a-z])([A-Z])", r"\1 \2", text)

    return text

def fix_hyphenation(text: str) -> str:
    text = re.sub(r"-\s+", "-", text)
    return text

def collapse_spaces(text: str) -> str:
    return re.sub(r"\s{2,}", " ", text).strip()


def clean_ocr_text(text: str) -> str:
    text = fix_broken_words(text)
    text = fix_hyphenation(text)
    text = restore_word_boundaries(text)
    text = collapse_spaces(text)
    return text
