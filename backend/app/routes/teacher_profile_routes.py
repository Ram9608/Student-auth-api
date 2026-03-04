from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, TeacherProfile
from app.core.dependencies import teacher_only
import datetime

router = APIRouter()


@router.get("/me")
def get_teacher_profile(db: Session = Depends(get_db), current_user: User = Depends(teacher_only)):
    p = db.query(TeacherProfile).filter(TeacherProfile.user_id == current_user.id).first()
    base = {"id": current_user.id, "full_name": current_user.full_name, "email": current_user.email, "role": current_user.role}
    if not p:
        return {**base, "profile_complete": False}
    return {
        **base, "profile_complete": True,
        "mobile": p.mobile, "designation": p.designation, "department": p.department,
        "city": p.city, "state": p.state, "bio": p.bio,
    }


@router.post("/save")
def save_teacher_profile(data: dict, db: Session = Depends(get_db), current_user: User = Depends(teacher_only)):
    p = db.query(TeacherProfile).filter(TeacherProfile.user_id == current_user.id).first()
    fields = {
        "mobile": data.get("mobile"), "designation": data.get("designation"),
        "department": data.get("department"), "city": data.get("city"),
        "state": data.get("state"), "bio": data.get("bio"),
    }
    if p:
        for k, v in fields.items():
            setattr(p, k, v)
        p.updated_at = datetime.datetime.utcnow()
    else:
        p = TeacherProfile(user_id=current_user.id, **fields)
        db.add(p)
    db.commit()
    return {"message": "Teacher profile saved successfully!", "profile_complete": True}
