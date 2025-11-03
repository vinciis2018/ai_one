# ============================================
# text_extractor.py
# Handles text extraction from PDFs and images
# ============================================

import io
from PIL import Image
import fitz  # PyMuPDF
import pytesseract

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
