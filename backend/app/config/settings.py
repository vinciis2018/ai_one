# ============================================
# settings.py
# Centralized configuration + path management
# ============================================

import os
from pathlib import Path
import yaml


# Determine project base path (backend/app)
BASE_DIR = Path(__file__).resolve().parent.parent

# Load config.yaml
config_path = BASE_DIR / "config.yaml"
with open(config_path, "r") as f:
    config = yaml.safe_load(f)

# Resolve absolute data paths (always inside backend/app/data)
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)


GENERAL_FAISS_INDEX_PATH = DATA_DIR / Path(config["paths"]["general"]["faiss_index"]).name
GENERAL_SQLITE_DB_PATH = DATA_DIR / Path(config["paths"]["general"]["sqlite_db"]).name
FAISS_INDEX_PATH = DATA_DIR / Path(config["paths"]["faiss_index"]).name
SQLITE_DB_PATH = DATA_DIR / Path(config["paths"]["sqlite_db"]).name
UPLOAD_FOLDER = DATA_DIR / Path(config["paths"]["upload_folder"]).name
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

# Embedding configuration
EMBEDDING_DIM = config.get("embedding", {}).get("dimension", 384)


# AWS Configuration
AWS_ACCESS_KEY = config.get("aws", {}).get("access_key")
AWS_SECRET_KEY = config.get("aws", {}).get("secret_key")
AWS_REGION = config.get("aws", {}).get("region")
S3_BUCKET = config.get("aws", {}).get("s3_bucket")
