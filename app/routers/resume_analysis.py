from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.routers.deps import get_current_user, get_db
from app.services.resume_analyzer import ResumeAnalyzerService
from app.schemas.resume_analysis import ResumeAnalysisResponse
from app.models.user import User

router = APIRouter(prefix="/resume-analyzer", tags=["Resume Analyzer"])

@router.post("/analyze/{job_id}", response_model=ResumeAnalysisResponse)
def analyze_resume(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze the current user's resume against a specific job.
    Returns match score, missing skills, and improvement suggestions.
    """
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can use Resume Analyzer")

    service = ResumeAnalyzerService(db)
    try:
        analysis = service.analyze(current_user.id, job_id)
        return analysis
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Analysis Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during analysis")
