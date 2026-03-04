import os
import shutil
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse

from app.database import get_db
from app.models import Resume, User, Job, StudentProfile, Application
from app.schemas import ResumeResponse
from app.core.dependencies import student_only, get_current_user
from app.utils.resume_parser import extract_text_from_pdf
from app.ml.job_recommender import recommend_jobs

router = APIRouter()

UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Skill→Course mapping (Internal, no external API calls for logic)
SKILL_COURSE_MAP = {
    "docker":       {"name": "Docker for Beginners",        "link": "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/", "tag": "Udemy"},
    "kubernetes":   {"name": "Kubernetes Mastery",          "link": "https://www.udemy.com/course/kubernetesmastery/",              "tag": "Udemy"},
    "python":       {"name": "Python Bootcamp",             "link": "https://www.udemy.com/course/complete-python-bootcamp/",          "tag": "Udemy"},
    "react":        {"name": "React - The Complete Guide",  "link": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", "tag": "Udemy"},
    "javascript":   {"name": "JavaScript Full Course",      "link": "https://www.youtube.com/watch?v=PkZNo7MFNFg",                     "tag": "YouTube"},
    "machine learning": {"name": "ML A-Z by Andrew Ng",    "link": "https://www.coursera.org/learn/machine-learning",                "tag": "Coursera"},
    "ml":           {"name": "Machine Learning A-Z Udemy",  "link": "https://www.udemy.com/course/machinelearning/",                   "tag": "Udemy"},
    "deep learning": {"name": "Deep Learning Specialization","link": "https://www.coursera.org/specializations/deep-learning",        "tag": "Coursera"},
    "tensorflow":   {"name": "TensorFlow Tutorials",        "link": "https://www.tensorflow.org/tutorials",                           "tag": "Docs"},
    "fastapi":      {"name": "FastAPI Full Course",          "link": "https://www.youtube.com/watch?v=7t2alSnE2-I",                    "tag": "YouTube"},
    "sql":          {"name": "SQL & PostgreSQL Bootcamp",   "link": "https://www.udemy.com/course/sql-and-postgresql/",               "tag": "Udemy"},
    "postgresql":   {"name": "PostgreSQL Tutorial",         "link": "https://www.youtube.com/watch?v=qw--VYLpxG4",                    "tag": "YouTube"},
    "git":          {"name": "Git & GitHub Crash Course",   "link": "https://www.youtube.com/watch?v=RGOj5yH7evk",                    "tag": "YouTube"},
    "aws":          {"name": "AWS Cloud Practitioner",      "link": "https://www.udemy.com/course/aws-certified-cloud-practitioner-new/", "tag": "Udemy"},
    "java":         {"name": "Java Programming Masterclass", "link": "https://www.udemy.com/course/java-the-complete-java-developer-course/", "tag": "Udemy"},
    "c++":          {"name": "C++ Complete Guide",          "link": "https://www.udemy.com/course/the-complete-cpp-masterclass/",     "tag": "Udemy"},
    "nlp":          {"name": "NLP with Python",             "link": "https://www.udemy.com/course/nlp-natural-language-processing-with-python/", "tag": "Udemy"},
    "opencv":       {"name": "OpenCV Python",               "link": "https://www.youtube.com/watch?v=kdLM6AOd2vc",                    "tag": "YouTube"},
    "data science": {"name": "Data Science Bootcamp",       "link": "https://www.udemy.com/course/the-data-science-course-complete-data-science-bootcamp/", "tag": "Udemy"},
    "flask":        {"name": "Flask Web Development",       "link": "https://www.udemy.com/course/python-and-flask-bootcamp-create-websites-using-flask/", "tag": "Udemy"},
    "node":         {"name": "Node.js Complete Course",     "link": "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/", "tag": "Udemy"},
    "typescript":   {"name": "TypeScript Course",           "link": "https://www.udemy.com/course/understanding-typescript/",          "tag": "Udemy"},
    "excel":        {"name": "Microsoft Excel Mastery",     "link": "https://www.udemy.com/course/microsoft-excel-2013-from-beginner-to-advanced-and-beyond/", "tag": "Udemy"},
    "communication":{"name": "Communication Skills",        "link": "https://www.coursera.org/learn/communication-skills",            "tag": "Coursera"},
    "leadership":   {"name": "Leadership & Management",     "link": "https://www.coursera.org/learn/leadership-healthcare",           "tag": "Coursera"},
}

def extract_skills_from_text(text: str) -> list[str]:
    """Extract known skills from text by keyword matching."""
    text_lower = text.lower()
    found = []
    all_skills = list(SKILL_COURSE_MAP.keys()) + [
        "django", "mongodb", "redis", "linux", "bash", "html", "css",
        "vue", "angular", "scala", "spark", "hadoop", "tableau", "power bi",
        "figma", "photoshop", "agile", "scrum", "ci/cd", "jenkins", "terraform",
    ]
    for skill in all_skills:
        if skill.lower() in text_lower:
            found.append(skill)
    return list(set(found))


# 1. UPLOAD RESUME (Student Only)
@router.post("/upload", response_model=ResumeResponse)
def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(student_only)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF format is allowed.")

    file_path = f"{UPLOAD_DIR}/{current_user.id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = extract_text_from_pdf(file_path)

    # Check if resume already exists → update instead of duplicate
    existing = db.query(Resume).filter(Resume.student_id == current_user.id).first()
    if existing:
        existing.file_path = file_path
        existing.extracted_text = extracted_text
        db.commit()
        db.refresh(existing)
        return existing

    resume = Resume(student_id=current_user.id, file_path=file_path, extracted_text=extracted_text)
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


# 2. SMART RESUME ANALYSIS (ML-based, Internal API only)
@router.get("/analyze")
def analyze_resume(db: Session = Depends(get_db), current_user: User = Depends(student_only)):
    resume = db.query(Resume).filter(Resume.student_id == current_user.id).first()
    if not resume or not resume.extracted_text:
        raise HTTPException(status_code=404, detail="Please upload your resume first to get analysis.")

    resume_text = resume.extracted_text

    # 1. Get student profile skills
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    profile_skills_raw = ""
    if profile and profile.technical_skills:
        profile_skills_raw = profile.technical_skills

    # 2. Extract skills from resume text
    resume_skills = extract_skills_from_text(resume_text + " " + profile_skills_raw)

    # 3. Get all active jobs (Internal API)
    jobs = db.query(Job).filter(Job.is_active == True).all()
    jobs_data = [{"id": j.id, "title": j.title, "description": j.description, "skills_required": j.skills_required} for j in jobs]

    # 4. ML-based job matching using TF-IDF (from job_recommender.py)
    recommended = []
    if jobs_data and resume_text:
        recommended = recommend_jobs(resume_text + " " + profile_skills_raw, jobs_data, top_n=5)

    # 5. Find missing skills (compare resume skills vs top job requirements)
    all_job_skills = set()
    for job in jobs_data:
        for s in job["skills_required"].split(","):
            all_job_skills.add(s.strip().lower())

    resume_skills_lower = set(s.lower() for s in resume_skills)
    missing_skills = [s for s in all_job_skills if s not in resume_skills_lower and len(s) > 2][:8]

    # 6. Match percentage (based on skill overlap with all jobs)
    if all_job_skills:
        matched = len(resume_skills_lower & all_job_skills)
        match_pct = min(round((matched / len(all_job_skills)) * 100, 1), 100)
    else:
        match_pct = 0

    # 7. Course suggestions based on missing skills (Internal skill→course map)
    courses = []
    seen_courses = set()
    for skill in missing_skills[:6]:
        skill_lower = skill.lower()
        for key, course in SKILL_COURSE_MAP.items():
            if key in skill_lower or skill_lower in key:
                if course["name"] not in seen_courses:
                    courses.append(course)
                    seen_courses.add(course["name"])
                break
    # Fill with general courses if not enough
    if len(courses) < 3:
        for key in list(SKILL_COURSE_MAP.keys())[:5]:
            if len(courses) >= 5:
                break
            c = SKILL_COURSE_MAP[key]
            if c["name"] not in seen_courses:
                courses.append(c)
                seen_courses.add(c["name"])

    return {
        "has_resume": True,
        "match_percentage": match_pct,
        "resume_skills": resume_skills,
        "missing_skills": missing_skills,
        "recommended_jobs": recommended,  # ML-matched via Internal API
        "courses": courses[:6],
        "source": "Internal API (TF-IDF ML Engine)",
    }


# 3. GET JOB RECOMMENDATIONS based on resume (Internal API)
@router.get("/job-suggestions")
def get_job_suggestions(db: Session = Depends(get_db), current_user: User = Depends(student_only)):
    resume = db.query(Resume).filter(Resume.student_id == current_user.id).first()
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()

    if not resume and not profile:
        # Return all active jobs if no resume
        jobs = db.query(Job).filter(Job.is_active == True).all()
        return {
            "source": "All Available Jobs (Upload resume for personalized suggestions)",
            "suggestions": [{"id": j.id, "title": j.title, "skills_required": j.skills_required, "score": 0, "is_suggested": False} for j in jobs]
        }

    combined_text = ""
    if resume and resume.extracted_text:
        combined_text += resume.extracted_text
    if profile and profile.technical_skills:
        combined_text += " " + profile.technical_skills

    jobs = db.query(Job).filter(Job.is_active == True).all()
    jobs_data = [{"id": j.id, "title": j.title, "description": j.description,
                  "skills_required": j.skills_required, "job_type": j.job_type,
                  "location_type": j.location_type, "salary": j.salary} for j in jobs]

    if combined_text and jobs_data:
        scored = recommend_jobs(combined_text, jobs_data, top_n=len(jobs_data))
        # Enrich with full job data
        job_map = {j["id"]: j for j in jobs_data}
        result = []
        for s in scored:
            jd = job_map.get(s["job_id"], {})
            result.append({**jd, "score": s["score"], "is_suggested": s["score"] > 10})
        return {"source": "Internal API (TF-IDF ML Engine based on your resume)", "suggestions": result}

    return {"source": "All Available Jobs", "suggestions": jobs_data}


# 4. DOWNLOAD RESUME
@router.get("/download/{student_id}")
def download_student_resume(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != 'teacher' and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    resume = db.query(Resume).filter(Resume.student_id == student_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return FileResponse(resume.file_path, media_type='application/pdf', filename=f"resume_{student_id}.pdf")


# 5. CHECK RESUME STATUS
@router.get("/status")
def resume_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.student_id == current_user.id).first()
    return {"uploaded": resume is not None, "has_text": bool(resume and resume.extracted_text)}
