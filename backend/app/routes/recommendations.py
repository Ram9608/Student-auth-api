from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resume, Job, User
from app.core.dependencies import student_only
from app.ml.job_recommender import recommend_jobs

# 🚀 Recommendation Router Setup
# Iska kaam hai: Student ke Resume aur Job Descriptions ko ML logic ke pass bhejna.

router = APIRouter()

@router.get("/jobs")
def recommend_jobs_for_student(
    db: Session = Depends(get_db),
    current_user: User = Depends(student_only)
):
    """
    🎯 GET: /recommendations/jobs
    
    Kaise kaam karta hai?
    1. Pehle current student ka uploaded Resume dhundta hai.
    2. Us resume se extracted_text nikalta hai.
    3. Phir DB se saare available Jobs fetch karta hai.
    4. Dono data ML model (TF-IDF + Cosine) ke pass bhejkar 'Similarity Score' calculate karwata hai.
    5. Top jobs return karta hai.
    """

    # 1️⃣ Fetch Student's Resume
    # Hmm check karenge ki kya is student ne resume upload kiya hai?
    resume = db.query(Resume).filter(
        Resume.student_id == current_user.id
    ).first()

    # Agar resume hi nahi hai toh recommendation kis basis par denge? Error handle kiya.
    if not resume or not resume.extracted_text:
        raise HTTPException(
            status_code=404,
            detail="Bhai, pehle apna resume upload karo! (Resume not found or empty)"
        )

    # 2️⃣ Fetch All Jobs
    # Match karne ke liye saare jobs fetch karte hain.
    # Note: Kaafi jobs ho toh pagination ya limit (ex: limit 100) lagana chahiye productivity ke liye.
    jobs = db.query(Job).all()

    if not jobs:
        return {"message": "Abhi koi jobs available nahi hain matching ke liye.", "recommended_jobs": []}

    # 3️⃣ Format Data for ML Logic
    # ML function ko list of dicts chahiye (Fast reading/processing ke liye dictionary best hai memory me)
    job_data = [
        {
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "skills_required": job.skills_required
        }
        for job in jobs
    ]

    # 4️⃣ Call ML Recommendation Engine
    # 🧠 Yahan real logic call ho raha hai!
    recommendations = recommend_jobs(
        resume_text=resume.extracted_text,
        jobs=job_data,
        top_n=5 # Top 5 jobs dikhate hain user ko standard UI ke liye
    )

    # 5️⃣ Final Response
    return {
        "student_id": current_user.id,
        "student_name": current_user.full_name,
        "recommended_jobs": recommendations
    }

# 💡 Kyun separate file? (Software Principle: SoC - Separation of Concerns)
# Taaki ML Logic (job_recommender.py) aur API/Routes (recommendations.py) alag rahe.
# Kal ko agar hum Advanced Model (like BERT) lagana chahe, toh sirf ML file change karni padegi.
