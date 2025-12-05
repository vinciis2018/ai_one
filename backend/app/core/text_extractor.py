# ============================================
# text_extractor.py
# Handles text extraction from PDFs and images
# ============================================

from app.llms.gemini import gemini_transcribe_image, gemini_analyze_snippet
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
# Extract text using llm
# ====================================================

def extract_text_from_image_with_llm(image_bytes: bytes) -> str:
    """
    Extracts text from image using Tesseract OCR.
    Supports PNG, JPG, and JPEG.
    """
   
    # Try OpenAI Vision API first (best quality)
    try:
        
        # Convert image to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
      
        response = gemini_analyze_snippet(base64_image)
        
        print(response, "::::::::::::::::::------- response gemini")
        
        # GPT-5-nano may use reasoning tokens, check for content
        text = response
        
        if text and text.strip():
            print(f"✅ Gemini extracted {len(text)} characters")
            return text.strip()
        else:
            print(f"⚠️ Gemini returned empty content. Finish reason: {response.choices[0].finish_reason}")
            print(f"   Reasoning tokens: {response.usage.completion_tokens_details.reasoning_tokens}")
            raise ValueError("Empty response from Gemini")
            
    except Exception as e:
        print(f"⚠️ Gemini failed: {e}")
        print("Please try again after some time")


def extract_text_with_llm(image_bytes: bytes) -> str:
    """
    Extracts text from image using OpenAI Vision API (best accuracy).
    Falls back to EasyOCR if OpenAI is unavailable.
    Better for handwritten notes and complex documents.
    """

    
    # Try OpenAI Vision API first (best quality)
    try:
        
        # Convert image to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
      
        response = gemini_transcribe_image(base64_image)
        
        print(response, "::::::::::::::::::------- response gemini")
        
        # GPT-5-nano may use reasoning tokens, check for content
        text = response
        
        if text and text.strip():
            print(f"✅ Gemini extracted {len(text)} characters")
            return text.strip()
        else:
            print(f"⚠️ Gemini returned empty content. Finish reason: {response.choices[0].finish_reason}")
            print(f"   Reasoning tokens: {response.usage.completion_tokens_details.reasoning_tokens}")
            raise ValueError("Empty response from Gemini")
            
    except Exception as e:
        print(f"⚠️ Gemini failed: {e}")
        print("Please try again after some time")
        




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
