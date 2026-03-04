from pydantic import BaseModel, EmailStr
from typing import List, Optional

# ================================
# USER SCHEMAS (Phase 2)
# ================================
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ================================
# JOB SCHEMAS (Phase 4)
# ================================

# 📝 JobCreate schema: Pydantic check validation karega jub teacher nayi job daal raha hoga.
class JobCreate(BaseModel):
    title: str
    description: str
    skills_required: str

# 📝 JobResponse schema: Frontend ko server se jo formatted data milega (SQL to JSON conversion mapping)
class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    skills_required: str
    teacher_id: int

    class Config:
        from_attributes = True # Pehle isko orm_mode bola jata tha. SQL object se Pydantic response serialize automatically convert karti hai.

# ================================
# RESUME SCHEMAS (Phase 6)
# ================================

class ResumeResponse(BaseModel):
    id: int
    student_id: int
    file_path: str
    extracted_text: Optional[str] = None # Error se bachne k liye default None de diya.

    class Config:
        from_attributes = True

# ================================
# VISION SCHEMAS (Phase 10)
# ================================

class FaceLoginRequest(BaseModel):
    image: Optional[str] = None # Base64 string from frontend

class FaceLoginResponse(BaseModel):
    verified: bool
    message: str
    user: Optional[str] = None
    role: Optional[str] = None
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"
