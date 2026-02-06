from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime


# Student Dashboard Schemas
class StudentDashboardResponse(BaseModel):
    profile_completeness: float
    profile_details: Dict
    next_steps: List[str]
    resume_score: float
    resume_breakdown: Dict
    matched_jobs_count: int
    missing_skills: List[Dict]
    recommended_courses: List[Dict]


class JobMatchBreakdownResponse(BaseModel):
    skill_match_percentage: float
    experience_match_percentage: float
    role_match_percentage: float
    final_match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    explanation: str


class ResumeComparisonResponse(BaseModel):
    old_version: int
    new_version: int
    skills_added: List[str]
    skills_removed: List[str]
    score_improvement: float
    old_score: Optional[float]
    new_score: Optional[float]
    improvement_percentage: float


class CourseProgressUpdate(BaseModel):
    progress_percentage: Optional[float] = None
    status: Optional[str] = None


# Teacher Schemas
class TeacherAnalyticsResponse(BaseModel):
    total_jobs_posted: int
    total_applications: int
    avg_applicant_score: float
    skill_demand_heatmap: Dict[str, int]
    jobs_without_applications: List[str]
    application_rate: float


class ApplicantRankingResponse(BaseModel):
    job_id: int
    job_title: str
    total_applicants: int
    applicants: List[Dict]


class ApplicationReviewRequest(BaseModel):
    rating: Optional[int] = None  # 1-5
    notes: Optional[str] = None
    rejection_reason: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: str  # applied, viewed, shortlisted, rejected
