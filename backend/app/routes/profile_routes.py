from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, StudentProfile
from app.core.dependencies import student_only, get_current_user
import json
import datetime

router = APIRouter()


# GET /profile/me - Fetch student's profile
@router.get("/me")
def get_my_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()

    base = {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
    }

    if not profile:
        return {**base, "profile_complete": False}

    return {
        **base,
        "profile_complete": True,
        "mobile": profile.mobile,
        "city": profile.city,
        "state": profile.state,
        "experience_type": profile.experience_type,
        "availability": profile.availability,
        "work_authorization": profile.work_authorization,
        "expected_salary": profile.expected_salary,
        "degree": profile.degree,
        "college": profile.college,
        "passing_year": profile.passing_year,
        "cgpa": profile.cgpa,
        "technical_skills": profile.technical_skills,
        "soft_skills": profile.soft_skills,
        "projects": json.loads(profile.projects) if profile.projects else [],
        "internships": json.loads(profile.internships) if profile.internships else [],
        "github": profile.github,
        "linkedin": profile.linkedin,
        "portfolio": profile.portfolio,
    }


# POST /profile/save - Create or update student profile
@router.post("/save")
def save_profile(data: dict, db: Session = Depends(get_db), current_user: User = Depends(student_only)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()

    def to_json(v):
        if isinstance(v, (list, dict)):
            return json.dumps(v)
        return v

    fields = {
        "mobile": data.get("mobile"),
        "city": data.get("city"),
        "state": data.get("state"),
        "experience_type": data.get("experience_type", "fresher"),
        "availability": data.get("availability"),
        "work_authorization": data.get("work_authorization", True),
        "expected_salary": data.get("expected_salary"),
        "degree": data.get("degree"),
        "college": data.get("college"),
        "passing_year": data.get("passing_year"),
        "cgpa": data.get("cgpa"),
        "technical_skills": data.get("technical_skills"),
        "soft_skills": data.get("soft_skills"),
        "projects": to_json(data.get("projects", [])),
        "internships": to_json(data.get("internships", [])),
        "github": data.get("github"),
        "linkedin": data.get("linkedin"),
        "portfolio": data.get("portfolio"),
    }

    if profile:
        for k, v in fields.items():
            setattr(profile, k, v)
        profile.updated_at = datetime.datetime.utcnow()
    else:
        profile = StudentProfile(user_id=current_user.id, **fields)
        db.add(profile)

    db.commit()
    db.refresh(profile)
    return {"message": "Profile saved successfully!", "profile_complete": True}
