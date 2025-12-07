# ============================================
# llm_manager.py
# Unified, environment-aware LLM controller
# (Auto-selects OpenAI → Hugging Face → Ollama → Fallback)
# ============================================

import os
from app.prompt.system_prompt import SYSTEM_PROMPT as system_prompt

from transformers import AutoTokenizer, AutoModelForCausalLM
from dotenv import load_dotenv
from openai import OpenAI
import logging
from google import genai
from google.genai import types

# ------------------------------------------------
# Load configuration
# ------------------------------------------------
load_dotenv()
logger = logging.getLogger("openai-llm-caller")

# Global configs
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or "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"
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5-nano")

open_ai_client = OpenAI(api_key=OPENAI_API_KEY)


# ------------------------------------------------
# Core LLM handler
# ------------------------------------------------
def call_openai(prompt: str) -> str:
    """
    Unified function to route query based on availability:
    1️⃣ OpenAI (if API key exists)
    """

    # =======================
    # 1️⃣ OpenAI
    # =======================
    try:
        logger.info(f"⚙️ Running OpenAI model: {OPENAI_MODEL}")

        response = open_ai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            # temperature=0.5,
            max_completion_tokens=8000,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.warning(f"⚠️ OpenAI failed: {e}")



def call_openai_multimodal(messages: list) -> str:
    """
    Unified function to route query based on availability:
    1️⃣ OpenAI (if API key exists)
    """

    # =======================
    # 1️⃣ OpenAI
    # =======================
    try:
        logger.info(f"⚙️ Running OpenAI model: {OPENAI_MODEL}")

        response = open_ai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            # temperature=0.5,
            max_completion_tokens=4000,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.warning(f"⚠️ OpenAI failed: {e}")
