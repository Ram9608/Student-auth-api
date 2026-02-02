
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.job import JobCreate, JobResponse
from app.models.user import User
from app.routers.deps import get_current_user, RoleChecker
from app.core.database import get_db
from app.crud import job as crud_job

router = APIRouter(prefix="/teacher", tags=["Teacher"])

# Security: Only teachers can access
allow_teacher = RoleChecker(["teacher"])

@router.post("/jobs", response_model=JobResponse, dependencies=[Depends(allow_teacher)])
def create_job(job: JobCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud_job.create_job(db, job, current_user.id)

@router.get("/jobs", response_model=List[JobResponse], dependencies=[Depends(allow_teacher)])
def get_my_posted_jobs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud_job.get_jobs_by_teacher(db, current_user.id)
@router.get("/jobs/{job_id}/applications", dependencies=[Depends(allow_teacher)])
def get_job_applications(job_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Verify job belongs to teacher
    job = crud_job.get_job(db, job_id)
    if not job or job.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view these applications")
    
    # 2. Fetch applications with student details
    from app.models.application import JobApplication
    from app.models.student import StudentProfile
    
    applications = db.query(JobApplication).filter(JobApplication.job_id == job_id).all()
    
    results = []
    for app_obj in applications:
        student = app_obj.student
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == student.id).first()
        
        results.append({
            "id": app_obj.id,
            "status": app_obj.status,
            "applied_at": app_obj.applied_at,
            "student_name": f"{student.first_name} {student.last_name}",
            "student_email": student.email,
            "resume_path": profile.resume_path if profile else None
        })
        
    return results
