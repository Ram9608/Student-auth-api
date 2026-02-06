
import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text # Use text for SQL execution safety

from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.routers import (
    auth_router, users_router, teacher_router, jobs_router, 
    resume_router, chatbot_router
)
# Enhanced feature routers
try:
    from app.routers import student_enhanced, teacher_enhanced, chatbot_enhanced
    ENHANCED_FEATURES_ENABLED = True
except ImportError:
    ENHANCED_FEATURES_ENABLED = False
    print("Enhanced features not yet migrated. Run database migrations first.")

# Import models to ensure they are registered with Base
from app.models import User 

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Frontend Build (SPA)
# Mount assets first so they don't get caught by the catch-all
if os.path.exists("react_frontend/dist/assets"):
    app.mount("/assets", StaticFiles(directory="react_frontend/dist/assets"), name="assets")

# Mount Uploads
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Core Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(teacher_router, prefix="/api/v1")
app.include_router(jobs_router, prefix="/api/v1")
app.include_router(resume_router, prefix="/api/v1")
app.include_router(chatbot_router, prefix="/api/v1")

# Include Enhanced Feature Routers (if available)
if ENHANCED_FEATURES_ENABLED:
    app.include_router(student_enhanced.router, prefix="/api/v1")
    app.include_router(teacher_enhanced.router, prefix="/api/v1")
    app.include_router(chatbot_enhanced.router, prefix="/api/v1")
    print("✅ Enhanced features loaded successfully")

@app.get("/api/v1/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    try:
        # Pinging database
        db.execute(text("SELECT 1"))
        return {"status": "online", "database": "connected"}
    except Exception as e:
        return {"status": "offline", "database": str(e)}

# ------------------------------------------------------------------------------
# SPA Catch-All Route (Must be last)
# ------------------------------------------------------------------------------

@app.get("/{full_path:path}", response_class=HTMLResponse, tags=["Frontend"])
async def catch_all(full_path: str):
    # Determine the file path
    dist_dir = "react_frontend/dist"
    
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
        
    if not os.path.exists(os.path.join(dist_dir, "index.html")):
        return HTMLResponse("<h1>Frontend not found</h1><p>Please build the React frontend.</p>", status_code=404)

    return FileResponse(os.path.join(dist_dir, "index.html"))
