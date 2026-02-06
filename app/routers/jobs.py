
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
    
    print(f"DEBUG: Student {current_user.id} ({current_user.email}) applying to job {job_id}")
    
    from app.crud.application import apply_to_job as crud_apply
    result = crud_apply(db, job_id, current_user.id)
    
    print(f"DEBUG: Application created/returned: ID={result.id}, Job={result.job_id}, Student={result.student_id}")
    
    return result
