# ============================================
# test_query.py
# End-to-end test for AI Assistant MVP
# Uploads a sample PDF, then queries the assistant
# ============================================

import requests
import os

BASE_URL = "http://127.0.0.1:8000"
UPLOAD_URL = f"{BASE_URL}/upload/"
QUERY_URL = f"{BASE_URL}/query/"

PDF_PATH = os.path.join(os.path.dirname(__file__), "example_notes.pdf")

# ====================================================
# 1️⃣ Upload sample PDF
# ====================================================

print("\n📤 Uploading sample educational PDF...")
files = {"file": open(PDF_PATH, "rb")}
response = requests.post(UPLOAD_URL, files=files)

if response.status_code == 200:
    print("✅ Upload successful!")
else:
    print(f"❌ Upload failed: {response.status_code} - {response.text}")
    exit()

# ====================================================
# 2️⃣ Query assistant with sample question
# ====================================================

query_texts = [
    "What does Newton's second law state?",
    "Explain the relationship between work and energy.",
    "What is the formula for gravitational force?"
]

for q in query_texts:
    print(f"\n💬 Asking: {q}")
    response = requests.post(QUERY_URL, json={"text": q})
    if response.status_code == 200:
        data = response.json()
        print(f"🤖 Answer: {data.get('answer')}")
        print(f"📚 Sources used: {data.get('sources_used', 0)}")
    else:
        print(f"❌ Query failed: {response.status_code} - {response.text}")
