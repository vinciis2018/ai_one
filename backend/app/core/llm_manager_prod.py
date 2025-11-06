# ============================================
# llm_manager.py
# Unified, environment-aware LLM controller
# (Auto-selects OpenAI → Hugging Face → Ollama → Fallback)
# ============================================

import os
import torch
import subprocess
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
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
LLM_MODE = os.getenv("LLM_MODE", "auto").lower()  # auto | huggingface | ollama | openai
HF_MODEL = os.getenv("HF_MODEL", "TinyLlama/TinyLlama-1.1B-Chat-v1.0")
FALLBACK_MODEL = "distilgpt2"
# OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")

open_ai_client = OpenAI(api_key=OPENAI_API_KEY)
print(open_ai_client)
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
# Hugging Face model cache
# ------------------------------------------------
_hf_pipeline = None

def get_hf_pipeline():
    """Load Hugging Face model once."""
    global _hf_pipeline
    if _hf_pipeline is None:
        logger.info(f"⚙️ Loading Hugging Face model: {HF_MODEL}")
        _hf_pipeline = pipeline(
            "text-generation",
            model=HF_MODEL,
            torch_dtype=torch.float16 if DEVICE != "cpu" else torch.float32,
            device_map="auto" if DEVICE != "cpu" else None,
            batch_size=4,
            max_new_tokens=256,
        )
    return _hf_pipeline

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

# def call_ollama(prompt: str, model: str = OLLAMA_MODEL) -> str:
#     """Run prompt via Ollama CLI."""
#     if not check_ollama_installed():
#         raise RuntimeError("Ollama not installed.")
#     try:
#         logger.info(f"🦙 Running Ollama model: {model}")
#         result = subprocess.run(
#             ["ollama", "run", model],
#             input=prompt.encode("utf-8"),
#             capture_output=True,
#             check=True,
#         )
#         return result.stdout.decode().strip()
#     except Exception as e:
#         logger.error(f"Ollama inference failed: {e}")
#         raise


# ------------------------------------------------
# Domain-aware prompt builder
# ------------------------------------------------
def build_domain_prompt(prompt: str, domain: str | None = None) -> str:
    """
    Add domain expertise and structured guidance.
    """
    domain_map = {
        "physics": "a Physics expert tutor for competitive exams",
        "chemistry": "a Chemistry instructor specializing in NEET/CBSE topics",
        "math": "a Mathematics problem-solving coach",
        "biology": "a NEET Biology mentor with deep conceptual clarity",
        "programming": "a Software Engineering mentor specializing in Python and AI",
        "general": "an educational AI assistant helping students learn any subject",
        "science": "a Science tutor for competitive exams",
        "coaching": "a Coaching tutor for competitive exams",
    }

    role = domain_map.get(domain.lower() if domain else "general", domain_map["general"])

    system_prompt = (
        f"You are {role}. "
        "Answer only using the provided context, ensuring conceptual accuracy. "
        "Explain clearly and concisely, as if teaching a student."
    )

    full_prompt = f"{system_prompt}\n\nUser question:\n{prompt}"
    return full_prompt


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

        # Build domain-conditioned prompt
    domain_prompt = build_domain_prompt(prompt, domain)


    # =======================
    # 1️⃣ OpenAI
    # =======================
    if LLM_MODE in ["auto", "openai"] and OPENAI_API_KEY:
        try:
            response = open_ai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": f"You are {f"{domain} expert" or 'an educational'} AI assistant that answers based on provided context."},
                    {"role": "user", "content": domain_prompt},
                ],
                temperature=0.5,
                max_tokens=300,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.warning(f"⚠️ OpenAI failed: {e}")

    # =======================
    # 2️⃣ Hugging Face
    # =======================
    if LLM_MODE in ["auto", "huggingface"]:
        try:
            pipe = get_hf_pipeline()
            outputs = pipe(domain_prompt, num_return_sequences=1, do_sample=True)
            return outputs[0]["generated_text"].strip()
        except Exception as e:
            logger.warning(f"⚠️ Hugging Face failed: {e}")

    # =======================
    # 3️⃣ Ollama
    # =======================
    # if LLM_MODE in ["auto", "ollama"]:
    #     try:
    #         return call_ollama(domain_prompt)
    #     except Exception as e:
    #         logger.warning(f"⚠️ Ollama failed: {e}")

    # =======================
    # 4️⃣ Offline fallback
    # =======================
    try:
        logger.info("⚙️ Using offline fallback model.")
        tokenizer = AutoTokenizer.from_pretrained(FALLBACK_MODEL)
        model = AutoModelForCausalLM.from_pretrained(FALLBACK_MODEL)
        inputs = tokenizer(domain_prompt, return_tensors="pt")
        outputs = model.generate(**inputs, max_new_tokens=128)
        return tokenizer.decode(outputs[0], skip_special_tokens=True)
    except Exception as e:
        logger.error(f"❌ All backends failed: {e}")
        return "I'm currently unable to answer due to system issues."
