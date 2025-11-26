# ============================================
# llm_manager.py
# Unified, environment-aware LLM controller
# (Auto-selects Hugging Face Transformers)
# ============================================

import os
from app.prompt.system_prompt import SYSTEM_PROMPT as system_prompt
from dotenv import load_dotenv
import logging
from openai import OpenAI

# ------------------------------------------------
# Load configuration
# ------------------------------------------------
load_dotenv()
logger = logging.getLogger("huggingface")

# Global configs
HF_MODEL = os.getenv("HF_MODEL", "openai/gpt-oss-120b")
HF_TOKEN = os.getenv("HF_TOKEN")


hf_client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_TOKEN
)

# ------------------------------------------------
# Core LLM handler
# ------------------------------------------------
def call_huggingface(prompt: str) -> str:
    """
    Unified function to route query based on availability:
    2️⃣ Hugging Face Transformers
    """
    # =======================
    # 2️⃣ Hugging Face
    # =======================
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


   
def call_huggingface_multimodal(messages: list) -> str:
    """
    Unified function to route query based on availability:
    2️⃣ Hugging Face Transformers
    """
    return ""