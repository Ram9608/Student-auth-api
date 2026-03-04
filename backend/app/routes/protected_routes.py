from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user, teacher_only, student_only
from app.models import User

router = APIRouter()

# 🔥 Yeh API general user fetch krti hai backend database se by decoding the header JWT Token. (Student + Teacher None Restricted)
@router.get("/me")
@router.get("/profile")
def my_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role
    }

# 🔥 Yeh Dashboard sirf Teacher khol sakta hai, Role verify karega.
@router.get("/teacher-dashboard")
def teacher_dashboard(user: User = Depends(teacher_only)):
    return {
        "message": "Welcome Teacher 👨‍🏫",
        "user": user.full_name
    }

# 🔥 Yeh Dashboard sirf Student khol saktay, Role verify karega.
@router.get("/student-dashboard")
def student_dashboard(user: User = Depends(student_only)):
    return {
        "message": "Welcome Student 🎓",
        "user": user.full_name
    }
