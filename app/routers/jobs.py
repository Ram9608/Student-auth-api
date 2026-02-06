
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.job import JobResponse
from app.models.user import User
from app.routers.deps import get_current_user, RoleChecker
from app.core.database import get_db
from app.crud import job as crud_job
from app.services.recommendation import RecommendationEngine # Import service

router = APIRouter(prefix="/jobs", tags=["Jobs"])

# Students and Teachers can view jobs
@router.get("/", response_model=List[JobResponse])
@router.get("", response_model=List[JobResponse])  # Also handle without trailing slash
def get_all_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud_job.get_jobs(db, skip, limit)

@router.get("/recommendations", response_model=List[JobResponse])
def get_job_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if user is student
    if current_user.role != 'student':
        raise HTTPException(status_code=400, detail='Only students can get recommendations')
    
    engine = RecommendationEngine(db)
    return engine.recommend_jobs(current_user.id)
@router.post("/{job_id}/apply", dependencies=[Depends(get_current_user)])
def apply_to_job(job_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != 'student':
        raise HTTPException(status_code=400, detail="Only students can apply for jobs")
    
    from app.crud.application import apply_to_job as crud_apply
    result = crud_apply(db, job_id, current_user.id)
    return result

@router.get("/my-applications")
def get_my_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != 'student':
        raise HTTPException(status_code=400, detail='Only students can view their applications')
    
    from app.models.application import JobApplication
    applications = db.query(JobApplication).filter(JobApplication.student_id == current_user.id).all()
    
    results = []
    for app_obj in applications:
        results.append({
            "id": app_obj.id,
            "job_id": app_obj.job_id,
            "job_title": app_obj.job.title,
            "company": app_obj.job.company,
            "status": app_obj.status,
            "reason": app_obj.rejection_reason,
            "applied_at": app_obj.applied_at
        })
    return results
