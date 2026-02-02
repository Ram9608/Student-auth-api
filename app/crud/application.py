from sqlalchemy.orm import Session
from app.models.application import JobApplication
from app.models.student import StudentProfile
from app.models.user import User

def apply_to_job(db: Session, job_id: int, student_id: int):
    # Check if already applied
    existing = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.student_id == student_id
    ).first()
    if existing:
        return existing
    
    db_application = JobApplication(job_id=job_id, student_id=student_id)
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

def get_applications_for_job(db: Session, job_id: int):
    return db.query(JobApplication).filter(JobApplication.job_id == job_id).all()

def get_student_applications(db: Session, student_id: int):
    return db.query(JobApplication).filter(JobApplication.student_id == student_id).all()
