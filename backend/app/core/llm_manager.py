# ============================================
# llm_manager.py
# Unified, environment-aware LLM controller
# (Auto-selects OpenAI → Hugging Face → Ollama → Fallback)
# ============================================

from app.llms.ollama import call_ollama, call_ollama_multimodal
from app.llms.huggingface import call_huggingface, call_huggingface_multimodal
from app.llms.gemini import call_gemini
from app.llms.openai import call_openai, call_openai_multimodal
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from dotenv import load_dotenv
import logging
import os

# ------------------------------------------------
# Load configuration
# ------------------------------------------------
load_dotenv()
logger = logging.getLogger("assistant-llm")

LLM_MODE = os.getenv("LLM_MODE", "auto").lower()  # auto | huggingface | ollama | openai | gemini
FALLBACK_MODEL = "distilgpt2"
# ------------------------------------------------
# Device detection
# ------------------------------------------------
def detect_device():
    """Detect best available compute device."""
    if torch.cuda.is_available():
        return "cuda"
    elif torch.backends.mps.is_available():
        return "mps"
    return "cpu"

DEVICE = detect_device()
logger.info(f"🧠 Using device: {DEVICE.upper()}")

# ------------------------------------------------
# Core LLM handler
# ------------------------------------------------
def call_llm(prompt: str) -> str:
    """
    Unified function to route query based on availability:
    1️⃣ OpenAI (if API key exists)
    2️⃣ Hugging Face Transformers
    3️⃣ Ollama (local)
    4️⃣ Offline Fallback
    """

    # =======================
    # 1️⃣ OpenAI
    # =======================
    if LLM_MODE in ["auto", "openai"]:
        return call_openai(prompt)

    # =======================
    # 1️⃣ Gemini
    # =======================
    if LLM_MODE in ["auto", "gemini"]:
       return call_gemini(prompt)
    
    # =======================
    # 2️⃣ Hugging Face
    # =======================
    if LLM_MODE in ["auto", "huggingface"]:
        return call_huggingface(prompt)

    # =======================
    # 3️⃣ Ollama
    # =======================
    if LLM_MODE in ["auto", "ollama"]:
        return call_ollama(prompt)

    # =======================
    # 4️⃣ Offline fallback
    # =======================
    try:
        logger.info("⚙️ Using offline fallback model.")
        tokenizer = AutoTokenizer.from_pretrained(FALLBACK_MODEL)
        model = AutoModelForCausalLM.from_pretrained(FALLBACK_MODEL)
        inputs = tokenizer(prompt, return_tensors="pt")
        outputs = model.generate(**inputs, max_new_tokens=128)
        return tokenizer.decode(outputs[0], skip_special_tokens=True)
    except Exception as e:
        logger.error(f"❌ All backends failed: {e}")
        return "I'm currently unable to answer due to system issues."




# ------------------------------------------------
# Core LLM multimodal handler
# ------------------------------------------------
def call_llm_multimodal(messages: list) -> str:
    """
    Unified function to route query based on availability:
    1️⃣ OpenAI (if API key exists)
    2️⃣ Hugging Face Transformers
    3️⃣ Ollama (local)
    4️⃣ Offline Fallback
    """

    # =======================
    # 1️⃣ OpenAI
    # =======================
    if LLM_MODE in ["auto", "openai"]:
        call_openai_multimodal(messages)

    # =======================
    # 1️⃣ Gemini
    # =======================
    # if LLM_MODE in ["auto", "gemini"]:
    #    call_gemini_multimodal(messages)
    
    # =======================
    # 2️⃣ Hugging Face
    # =======================
    if LLM_MODE in ["auto", "huggingface"]:
        call_huggingface_multimodal(messages)

    # =======================
    # 3️⃣ Ollama
    # =======================
    if LLM_MODE in ["auto", "ollama"]:
        call_ollama_multimodal(messages)