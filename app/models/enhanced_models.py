from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Enum, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

# Enums
class ApplicationStatus(str, enum.Enum):
    APPLIED = "applied"
    VIEWED = "viewed"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"

class CourseStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

# Application Model moved to app/models/application.py as JobApplication

# Resume Version Model
class ResumeVersion(Base):
    __tablename__ = "resume_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Extracted data
    extracted_skills = Column(JSON, nullable=True)  # ["Python", "React"]
    extracted_experience_years = Column(Float, nullable=True)
    
    # Scores
    resume_score = Column(Float, nullable=True)  # 0-100
    skill_score = Column(Float, nullable=True)
    experience_score = Column(Float, nullable=True)
    education_score = Column(Float, nullable=True)
    
    # Relationships
    student = relationship("User", foreign_keys=[student_id])

# Course Progress Model
class CourseProgress(Base):
    __tablename__ = "course_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_name = Column(String(300), nullable=False)
    course_url = Column(String(500), nullable=False)
    platform = Column(String(100), nullable=False)  # Udemy, Coursera, YouTube
    skill = Column(String(100), nullable=False)  # Associated skill
    
    status = Column(Enum(CourseStatus), default=CourseStatus.NOT_STARTED)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Progress tracking
    progress_percentage = Column(Float, default=0.0)  # 0-100
    
    # Relationships
    student = relationship("User", foreign_keys=[student_id])

# AI Recommendation Log Model
class RecommendationLog(Base):
    __tablename__ = "recommendation_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    
    # Scores
    recommendation_score = Column(Float, nullable=False)  # 0-100
    skill_match_score = Column(Float, nullable=False)
    experience_match_score = Column(Float, nullable=False)
    role_match_score = Column(Float, nullable=False)
    
    # Explanation
    matched_skills = Column(JSON, nullable=True)  # ["Python", "React"]
    missing_skills = Column(JSON, nullable=True)  # ["Docker", "AWS"]
    explanation = Column(Text, nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    shown_to_student = Column(Boolean, default=False)
    
    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    job = relationship("Job", foreign_keys=[job_id])

# Teacher Analytics Cache Model
class TeacherAnalytics(Base):
    __tablename__ = "teacher_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Cached metrics (updated daily)
    total_jobs_posted = Column(Integer, default=0)
    total_applications = Column(Integer, default=0)
    avg_applicant_score = Column(Float, default=0.0)
    
    # Skill demand data
    skill_demand_data = Column(JSON, nullable=True)  # {"Python": 10, "React": 8}
    
    # Timestamps
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    teacher = relationship("User", foreign_keys=[teacher_id])

# Email Notification Queue Model
class EmailNotification(Base):
    __tablename__ = "email_notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    recipient_email = Column(String(255), nullable=False)
    subject = Column(String(500), nullable=False)
    body = Column(Text, nullable=False)
    
    # Metadata
    notification_type = Column(String(100), nullable=False)  # application_update, shortlist, etc.
    sent = Column(Boolean, default=False)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Error tracking
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
