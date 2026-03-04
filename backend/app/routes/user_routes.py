from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..core.dependencies import teacher_only

router = APIRouter()

@router.get("/students")
def get_students(db: Session = Depends(get_db), current_user: User = Depends(teacher_only)):
    students = db.query(User).filter(User.role == 'student').all()
    return [{
        "id": s.id,
        "full_name": s.full_name,
        "email": s.email,
        "profile_complete": s.profile is not None
    } for s in students]
