from sqlalchemy.orm import Session
from app.models.job import Job
from typing import List, Optional

class InternalJobService:
    def __init__(self, db: Session):
        self.db = db

    def get_all_jobs(self) -> List[Job]:
        """
        Internal API method to fetch jobs.
        This replaces direct database queries in recommendation logic.
        """
        try:
            return self.db.query(Job).all()
        except Exception as e:
            print(f"Internal Job API Error: {str(e)}")
            return []
    
    def get_job_by_id(self, job_id: int) -> Optional[Job]:
        """Fetch a specific job by ID internally."""
        try:
            return self.db.query(Job).filter(Job.id == job_id).first()
        except Exception as e:
            return None

    def get_jobs_by_skills(self, skills: List[str]) -> List[Job]:
        """
        Advanced internal search using basic text matching (simulated search engine).
        Returns jobs that have at least one matching skill.
        """
        if not skills:
            return []
        
        # This is a naive implementation; for production, use full-text search or vector DB if available.
        all_jobs = self.get_all_jobs()
        matched_jobs = []
        
        skills_lower = set(s.lower() for s in skills)
        
        for job in all_jobs:
            if not job.required_skills:
                continue
            
            job_skills = set(s.lower() for s in job.required_skills)
            if skills_lower.intersection(job_skills):
                matched_jobs.append(job)
                
        return matched_jobs

