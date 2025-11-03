

# AI Assistant MVP


**Features:**
- Upload notes/images (OCR + text extraction)
- Chunk + embed text
- Simple RAG Q&A with LLM
- Frontend chat interface


## Setup
```
git clone <repo>
cd ai-assistant-mvp
```


### Backend
```
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```


### Frontend
```
cd frontend
npm install
npm run dev
```


Visit http://localhost:5173 (frontend) and http://localhost:8000/docs (API docs)


✅ MVP complete with all stubs ready for local development and expansion to full RAG + personalization.