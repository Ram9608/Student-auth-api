
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class JobBase(BaseModel):
    title: str
    description: str
    company: str
    location: Optional[str] = None
    required_skills: List[str]
    experience_level: str

class JobCreate(JobBase):
    pass

class JobUpdate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    teacher_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
