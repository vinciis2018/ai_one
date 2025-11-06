from app.core.logger_middleware import LoggerMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, aws, query_image, query, status, upload, converstions, coaching

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
app.include_router(query.router, prefix="/query", tags=["Query"])  # This is correct
app.include_router(status.router, prefix="/status", tags=["System Health"])
app.include_router(converstions.router, prefix="/conversations", tags=["Conversations"])
app.include_router(coaching.router, prefix="/coachings", tags=["Coaching"])
app.include_router(query_image.router, prefix="/queryimage", tags=["Query Image"])

@app.get("/")
def root():
  return {
    "message": "AI Assistant MVP Backend Running 🚀"
  }