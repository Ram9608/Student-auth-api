from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.user import UserResponse

class ApplicationBase(BaseModel):
    job_id: int

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationResponse(ApplicationBase):
    id: int
    student_id: int
    status: str
    applied_at: datetime
    student: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ApplicationWithStudent(ApplicationResponse):
    student_name: str
    student_email: str
    resume_path: Optional[str] = None
