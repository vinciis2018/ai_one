# ============================================
# logger_middleware.py
# Observability middleware for FastAPI
# Logs query latency, success/failure, and basic analytics
# ============================================

import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.config.settings import BASE_DIR  # <-- use central settings
import os
import yaml
from pathlib import Path

# ====================================================
# Load configuration safely from settings directory
# ====================================================
CONFIG_FILE = BASE_DIR / "config.yaml"
if CONFIG_FILE.exists():
    with open(CONFIG_FILE, "r") as f:
        CONFIG = yaml.safe_load(f)
else:
    CONFIG = {}

# Determine log file path
LOG_RELATIVE = CONFIG.get("logging", {}).get("file", "backend/app/data/logs/app.log")
LOG_PATH = (BASE_DIR / Path(LOG_RELATIVE).name).resolve()

# Ensure log directory exists
os.makedirs(LOG_PATH.parent, exist_ok=True)

# Logging level (fallback to INFO)
LOG_LEVEL = CONFIG.get("logging", {}).get("level", "INFO").upper()

# ====================================================
# Setup Python Logger
# ====================================================
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("assistant-logger")

# ====================================================
# Middleware for FastAPI
# ====================================================
class LoggerMiddleware(BaseHTTPMiddleware):
    """Logs every request and measures latency."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        path = request.url.path
        method = request.method

        try:
            response = await call_next(request)
            latency = round((time.time() - start_time) * 1000, 2)
            logger.info(f"{method} {path} - {response.status_code} - {latency}ms")
            return response
        except Exception as e:
            latency = round((time.time() - start_time) * 1000, 2)
            logger.error(f"{method} {path} - ERROR - {latency}ms - {str(e)}")
            raise e

# ====================================================
# Utility Loggers
# ====================================================
def log_query_event(query: str, answer: str, success: bool = True):
    """Logs each query event for observability and debugging."""
    status = "SUCCESS" if success else "FAILURE"
    logger.info(f"[{status}] Query: {query[:80]} | Answer: {answer[:80]}")
