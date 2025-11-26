# ============================================
# llm_manager.py
# Unified, environment-aware LLM controller
# (Auto-selects OpenAI → Hugging Face → Ollama → Fallback)
# ============================================

import os
import subprocess
from dotenv import load_dotenv
import logging

# ------------------------------------------------
# Load configuration
# ------------------------------------------------
load_dotenv()
logger = logging.getLogger("ollama")

# Global configs
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")

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


   
def call_ollama_multimodal(messages: list) -> str:
    """
    Unified function to route query based on availability:
    1️⃣ Ollama
    """
    return ""