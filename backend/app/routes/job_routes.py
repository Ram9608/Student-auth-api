from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Job, User, StudentProfile
from app.schemas import JobCreate, JobResponse
from app.core.dependencies import teacher_only, get_current_user

router = APIRouter()


def job_to_dict(job, app_count=None):
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "skills_required": job.skills_required,
        "experience_required": job.experience_required,
        "job_type": job.job_type,
        "location_type": job.location_type,
        "salary": job.salary,
        "last_date": job.last_date,
        "is_active": job.is_active,
        "teacher_id": job.teacher_id,
        "created_at": str(job.created_at),
        "application_count": app_count if app_count is not None else len(job.applications),
    }


# 1. CREATE JOB (Teacher only)
@router.post("/")
def create_job(job: dict, db: Session = Depends(get_db), current_user: User = Depends(teacher_only)):
    new_job = Job(
        title=job.get("title"),
        description=job.get("description"),
        skills_required=job.get("skills_required", ""),
        experience_required=job.get("experience_required", "fresher"),
        job_type=job.get("job_type", "full-time"),
        location_type=job.get("location_type", "remote"),
        salary=job.get("salary"),
        last_date=job.get("last_date"),
        teacher_id=current_user.id,
        is_active=True
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return job_to_dict(new_job, 0)


# 2. GET ALL ACTIVE JOBS (Public/Students)
@router.get("/")
def get_all_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).filter(Job.is_active == True).all()
    return [job_to_dict(j) for j in jobs]


# 3. GET MY JOBS (Teacher only - all including inactive)
@router.get("/my")
def get_my_jobs(db: Session = Depends(get_db), current_user: User = Depends(teacher_only)):
    jobs = db.query(Job).filter(Job.teacher_id == current_user.id).all()
    return [job_to_dict(j, len(j.applications)) for j in jobs]


# 4. TOGGLE JOB STATUS (active/closed)
@router.patch("/{job_id}/toggle")
def toggle_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(teacher_only)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    if job.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your job.")
    job.is_active = not job.is_active
    db.commit()
    return {"message": f"Job {'activated' if job.is_active else 'closed'} successfully.", "is_active": job.is_active}


# 5. DELETE JOB (Teacher only)
@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(teacher_only)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    if job.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your job.")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully."}


# 6. APPLY FOR JOB (Student only)
@router.post("/apply/{job_id}")
def apply_for_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'student':
        raise HTTPException(status_code=403, detail="Only students can apply.")
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    if not job.is_active:
        raise HTTPException(status_code=400, detail="This job is no longer accepting applications.")
    from app.models import Application, StudentProfile, Resume
    
    # 📝 Check 1: Profile Exists?
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Please complete your 'Profile' section first before applying!")

    # 📄 Check 2: Resume Uploaded?
    resume = db.query(Resume).filter(Resume.student_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=400, detail="Resume not found! Please upload your Resume in the 'Resume / CV' tab first.")

    existing = db.query(Application).filter(Application.job_id == job_id, Application.student_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied to this job!")
    
    new_app = Application(
        job_id=job_id, 
        student_id=current_user.id, 
        status="applied",
        reason="Application received. Awaiting teacher review."
    )
    db.add(new_app)
    db.commit()
    return {"message": "Applied successfully! Your profile and resume have been shared with the teacher."}


# 7. GET MY APPLICATIONS (Student)
@router.get("/applications/my")
def get_my_applications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models import Application
    apps = db.query(Application).filter(Application.student_id == current_user.id).all()
    return [{
        "id": a.id, "job_title": a.job.title, "status": a.status,
        "test_date": a.test_date, "test_time": a.test_time, "test_info": a.test_info,
        "reason": a.reason, "applied_at": str(a.applied_at)
    } for a in apps]


# 8. GET ALL APPLICATIONS FOR TEACHER (with student details)
@router.get("/applications/all")
def get_all_applications(db: Session = Depends(get_db), current_user: User = Depends(teacher_only)):
    from app.models import Application, Resume
    apps = db.query(Application).join(Job).filter(Job.teacher_id == current_user.id).all()
    result = []
    for a in apps:
        student = a.student
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == student.id).first()
        resume = db.query(Resume).filter(Resume.student_id == student.id).first()
        result.append({
            "id": a.id,
            "student_id": student.id,
            "student_name": student.full_name,
            "student_email": student.email,
            "job_title": a.job.title,
            "job_id": a.job_id,
            "status": a.status,
            "reason": a.reason,
            "test_date": a.test_date,
            "test_time": a.test_time,
            "test_info": a.test_info,
            "applied_at": str(a.applied_at),
            "resume_url": f"/resumes/download/{student.id}" if resume else None,
            "degree": profile.degree if profile else None,
            "college": profile.college if profile else None,
            "technical_skills": profile.technical_skills if profile else None,
            "github": profile.github if profile else None,
            "linkedin": profile.linkedin if profile else None,
        })
    return result


# 9. UPDATE APPLICATION STATUS (Teacher)
@router.put("/application/{app_id}")
def update_application_status(app_id: int, data: dict, db: Session = Depends(get_db), current_user: User = Depends(teacher_only)):
    from app.models import Application
    from app.ai.groq_client import ask_groq
    import random
    
    app_obj = db.query(Application).filter(Application.id == app_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found.")
    if app_obj.job.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")
        
    status = data.get("status", app_obj.status)
    app_obj.status = status
    user_reason = data.get("reason", "").strip()
    
    # 🏆 ACCEPTED: Test Scheduling + AI Congratulatory Msg
    if status == "accepted":
        app_obj.test_date = data.get("test_date")
        app_obj.test_time = data.get("test_time")
        # Ensure it's marked as internal proctored test as requested by user
        app_obj.test_info = data.get("test_info", "Internal AI-Proctored Assessment Portal")
        
        if not user_reason:
            # AI Generate Congratulatory Message
            sys_p = "You are a professional HR manager. Generate a 2-sentence highly congratulatory message."
            user_p = f"Candidate {app_obj.student.full_name} has been shortlisted for the {app_obj.job.title} role. Suggest they prepare for the internal proctored test."
            app_obj.reason = ask_groq(sys_p, user_p)
        else:
            app_obj.reason = user_reason
    
    # 🤝 REJECTED: AI Empathetic / Sympathy Msg
    elif status == "rejected":
        if not user_reason:
            # AI Generate Empathetic Message
            sys_p = "You are an empathetic Career Mentor. Generate a 2-sentence kind rejection message with growth advice."
            user_p = f"Candidate {app_obj.student.full_name} was not selected for {app_obj.job.title}. Be encouraging and professional."
            app_obj.reason = ask_groq(sys_p, user_p)
        else:
            app_obj.reason = user_reason
            
        # Clear test info
        app_obj.test_date = None
        app_obj.test_time = None
        app_obj.test_info = None

    db.commit()
    return {"message": f"Application {status} successfully with AI-assisted feedback."}


# 10. GET STUDENT PROFILE (Teacher readonly view)
@router.get("/student-profile/{student_id}")
def view_student_profile(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(teacher_only)):
    import json
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == student_id).first()
    return {
        "full_name": student.full_name,
        "email": student.email,
        "mobile": profile.mobile if profile else None,
        "city": profile.city if profile else None,
        "state": profile.state if profile else None,
        "degree": profile.degree if profile else None,
        "college": profile.college if profile else None,
        "passing_year": profile.passing_year if profile else None,
        "cgpa": profile.cgpa if profile else None,
        "experience_type": profile.experience_type if profile else None,
        "technical_skills": profile.technical_skills if profile else None,
        "soft_skills": profile.soft_skills if profile else None,
        "github": profile.github if profile else None,
        "linkedin": profile.linkedin if profile else None,
        "portfolio": profile.portfolio if profile else None,
        "projects": json.loads(profile.projects) if profile and profile.projects else [],
        "internships": json.loads(profile.internships) if profile and profile.internships else [],
    }
