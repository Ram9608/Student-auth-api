from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resume, Job, User
from app.core.dependencies import student_only
from app.utils.skill_matcher import analyze_skills

router = APIRouter()

# 🔍 GET API: Student kisi ek specific Job ID par click karega aur apna resume test check kar dega (Matcher System)
@router.get("/job/{job_id}")
def analyze_resume_for_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(student_only) # 🔒 Sirf Token wale student ke liye allowed h
):
    # 1. Pehle database se dekhte hain kya user ne Resume pichle steps (Phase 6) me upload kiya hai?
    resume = db.query(Resume).filter(
        Resume.student_id == current_user.id
    ).first()

    # Agar File nai mili toh 404 (Not Found) fek denge
    if not resume:
        raise HTTPException(status_code=404, detail="Bhai, pehle resume upload kar do! (Resume not uploaded)")

    # 2. Phir checks database me kya user jo Job par verify maang raha wo Job list hai bhi?
    job = db.query(Job).filter(Job.id == job_id).first()
    
    # Same error agar galat Job ID de jaye to.
    if not job:
        raise HTTPException(status_code=404, detail="Galat id hai, yeh job abhi platform pe nahi hai.")

    # 3. Yahaan MAGIC HAPPENS! Student ka text AND Teacher ki job requirements ko hamari Skill matcher module me match kar rahe hain. 
    result = analyze_skills(
        resume_text=resume.extracted_text or "", # .pdf ka data yahan extract hoke already save ho rakha hai SQL me 
        job_skills=job.skills_required
    )

    # Output wapas JSON bna kar Frontend ki screen ke Dashboard par phenk denge
    return {
        "job_title": job.title,
        "analysis": result
    }
