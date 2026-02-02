
from sqlalchemy.orm import Session
from app.models.job import Job
from app.schemas.job import JobCreate

def create_job(db: Session, job: JobCreate, teacher_id: int):
    db_job = Job(**job.model_dump(), teacher_id=teacher_id)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def get_jobs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Job).offset(skip).limit(limit).all()

def get_jobs_by_teacher(db: Session, teacher_id: int):
    return db.query(Job).filter(Job.teacher_id == teacher_id).all()

def get_job(db: Session, job_id: int):
    return db.query(Job).filter(Job.id == job_id).first()
