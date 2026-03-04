from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db

router = APIRouter()

@router.get("/health", summary="System health check")
async def health_check(db: Session = Depends(get_db)):
    """Check backend, DB, SMTP config, and AI service status."""

    # 1. Backend is always online if this endpoint responds
    backend_status = "online"

    # 2. DB check - run a simple query
    try:
        db.execute(text("SELECT 1"))
        db_status = "online"
    except Exception:
        db_status = "offline"

    # 3. SMTP check - just verify settings exist (no live connection needed)
    try:
        from ..config import settings
        if settings.SMTP_USER and settings.SMTP_PASS and settings.SMTP_SERVER:
            smtp_status = "configured"
        else:
            smtp_status = "offline"
    except Exception:
        smtp_status = "offline"

    # 4. AI check - verify FaceService can be imported
    try:
        from ..vision.face_service import FaceService
        ai_status = "online"
    except Exception:
        ai_status = "offline"

    return {
        "backend": backend_status,
        "db": db_status,
        "smtp": smtp_status,
        "ai": ai_status,
    }
