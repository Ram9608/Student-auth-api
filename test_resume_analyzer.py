
import sys
print("PRE-IMPORTS")
sys.stdout.flush()

import os
import json
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.student import StudentProfile
from app.models.job import Job
from app.services.resume_analyzer import ResumeAnalyzerService

print("IMPORTS DONE")
sys.stdout.flush()

def test_resume_analyzer():
    print("DEBUG: Starting test...")
    sys.stdout.flush()
    db = SessionLocal()
    print("DEBUG: DB Connected")
    sys.stdout.flush()
    try:
        # 1. Setup Data
        test_email = "test_analyzer_student@example.com"
        
        # Create/Get User
        user = db.query(User).filter(User.email == test_email).first()
        if not user:
            print("Creating User")
            user = User(
                email=test_email,
                hashed_password="mock_password",
                role="student",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
             print("User found")
        
        # Create/Update Student Profile
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        if not profile:
            profile = StudentProfile(user_id=user.id)
            db.add(profile)
        
        # Set Skills EXACTLY as per prompt
        profile.skills = "Python, SQL, Django, REST APIs" 
        db.commit()
        
        # Create/Get Job
        test_job_title = "Backend AI Engineer Test"
        job = db.query(Job).filter(Job.title == test_job_title).first()
        if not job:
            job = Job(
                title=test_job_title,
                description="Test Description",
                company="Test Corp",
                required_skills=["Python", "SQL", "Machine Learning"],
                experience_level="fresher",
                teacher_id=user.id 
            )
            db.add(job)
            db.commit()
            db.refresh(job)
        else:
            job.required_skills = ["Python", "SQL", "Machine Learning"]
            db.commit()

        # 2. Run Analysis
        print("Running Analysis...")
        sys.stdout.flush()
        service = ResumeAnalyzerService(db)
        result = service.analyze(student_id=user.id, job_id=job.id)
        
        # 3. Output Result
        print(json.dumps(result.model_dump(), indent=2))
        sys.stdout.flush()
        
    except Exception as e:
        print(f"TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_resume_analyzer()
