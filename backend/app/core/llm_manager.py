# ============================================
# llm_manager.py
# Unified, environment-aware LLM controller
# (Auto-selects OpenAI → Hugging Face → Ollama → Fallback)
# ============================================

import os
from app.prompt.system_prompt import SYSTEM_PROMPT as system_prompt
import torch
import subprocess
from transformers import AutoTokenizer, AutoModelForCausalLM
from dotenv import load_dotenv
from openai import OpenAI
import logging

# ------------------------------------------------
# Load configuration
# ------------------------------------------------
load_dotenv()
logger = logging.getLogger("assistant-llm")

# Global configs
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5-nano")
LLM_MODE = os.getenv("LLM_MODE", "auto").lower()  # auto | huggingface | ollama | openai
HF_MODEL = os.getenv("HF_MODEL", "openai/gpt-oss-120b")
HF_MODEL_OCR = os.getenv("HF_MODEL_OCR", "deepseek-ai/DeepSeek-OCR") ## not for chat, have to install it and run locally, so not using it

HF_TOKEN = os.getenv("HF_TOKEN")
FALLBACK_MODEL = "distilgpt2"
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")


open_ai_client = OpenAI(api_key=OPENAI_API_KEY)
hf_client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_TOKEN
)

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
# Ollama helpers
# ------------------------------------------------
def check_ollama_installed():
    """Check if Ollama CLI is available."""
    try:
        subprocess.run(["ollama", "--version"], capture_output=True, check=True)
        return True
    except Exception:
        return False

def call_ollama(prompt: str, model: str = OLLAMA_MODEL) -> str:
    """Run prompt via Ollama CLI."""
    if not check_ollama_installed():
        raise RuntimeError("Ollama not installed.")
    try:
        logger.info(f"🦙 Running Ollama model: {model}")
        result = subprocess.run(
            ["ollama", "run", model],
            input=prompt.encode("utf-8"),
            capture_output=True,
            check=True,
        )
        return result.stdout.decode().strip()
    except Exception as e:
        logger.error(f"Ollama inference failed: {e}")
        raise


# ------------------------------------------------
# Core LLM handler
# ------------------------------------------------
def call_llm(prompt: str, domain: str) -> str:
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
    if LLM_MODE in ["auto", "openai"] and OPENAI_API_KEY:
        try:
            logger.info(f"⚙️ Running OpenAI model: {OPENAI_MODEL}")

            response = open_ai_client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": f"You are a {domain} expert AI assistant that answers based on provided context."},
                    {"role": "user", "content": prompt},
                ],
                # temperature=0.5,
                max_completion_tokens=4000,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.warning(f"⚠️ OpenAI failed: {e}")

    # =======================
    # 2️⃣ Hugging Face
    # =======================
    if LLM_MODE in ["auto", "huggingface"]:
        try:
            logger.info(f"⚙️ Running Hugging Face model: {HF_MODEL}")

            response = hf_client.chat.completions.create(
                model=HF_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                # temperature=0.6,
                max_completion_tokens=8000,
            )
            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.warning(f"⚠️ Hugging Face failed: {e}")

    # =======================
    # 3️⃣ Ollama
    # =======================
    if LLM_MODE in ["auto", "ollama"]:
        try:
            return call_ollama(prompt)
        except Exception as e:
            logger.warning(f"⚠️ Ollama failed: {e}")

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

