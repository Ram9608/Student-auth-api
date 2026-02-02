
from pydantic import BaseModel
from typing import Optional, List

class EducationDetail(BaseModel):
    degree: str
    institute: str
    passing_year: str

class ProjectDetail(BaseModel):
    title: str
    description: str
    link: Optional[str] = None

class ExperienceDetail(BaseModel):
    company: str
    role: str
    duration: str

class StudentProfileBase(BaseModel):
    age: Optional[int] = None
    education: Optional[str] = None
    skills: List[str] = []
    preferred_job_role: Optional[str] = None
    experience_level: Optional[str] = None
    
    # --- New Fields ---
    resume_path: Optional[str] = None
    city_state: Optional[str] = None
    education_details: List[EducationDetail] = []
    projects: List[ProjectDetail] = []
    experience_details: List[ExperienceDetail] = []
    github_link: Optional[str] = None
    linkedin_link: Optional[str] = None
    fresher_status: Optional[str] = None
    availability: Optional[str] = None
    work_authorization: Optional[str] = "Indian Citizen"
    expected_salary: Optional[str] = None

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileUpdate(StudentProfileBase):
    pass

class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True
