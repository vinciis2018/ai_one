from app.core.logger_middleware import LoggerMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, aws, status, upload, converstions, coaching, teachers, students, query_lang, notes, knowledge_graph, speech

from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Assistant MVP")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)
# Logging middleware
app.add_middleware(LoggerMiddleware)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(aws.router, prefix="/aws", tags=["AWS"])
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(status.router, prefix="/status", tags=["System Health"])
app.include_router(converstions.router, prefix="/conversations", tags=["Conversations"])
app.include_router(coaching.router, prefix="/coachings", tags=["Coaching"])
app.include_router(teachers.router, prefix="/teachers", tags=["Teachers"])
app.include_router(students.router, prefix="/students", tags=["Teachers"])

app.include_router(query_lang.router, prefix="/querylang", tags=["Query Lang"])
app.include_router(notes.router, prefix="/notes", tags=["Notes"])
app.include_router(knowledge_graph.router, prefix="/knowledgegraph", tags=["Knowledge Graph"])

app.include_router(speech.router, prefix="/speech", tags=["Speech"])



@app.get("/")
def root():
  return {
    "message": "AI Assistant MVP Backend Running 🚀"
  }