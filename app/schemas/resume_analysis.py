from pydantic import BaseModel
from typing import List, Optional

class CourseRecommendation(BaseModel):
    skill: str
    course_name: str
    platform: str
    course_url: str = ""
    level: str = "Beginner"
    language: str = "English"

class ResumeAnalysisResponse(BaseModel):
    job_id: int
    job_title: str
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    explanation: str
    ai_improvement_suggestions: List[str]
    recommended_courses: List[CourseRecommendation]
