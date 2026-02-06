from sqlalchemy import Column, Integer, ForeignKey, DateTime, String, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="applied") # applied, reviewed, shortlisted, rejected
    rejection_reason = Column(String, nullable=True)
    
    # Enhanced fields
    viewed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    teacher_notes = Column(Text, nullable=True)
    teacher_rating = Column(Integer, nullable=True) # 1-5
    
    # Match scores (calculated at application time)
    skill_match_score = Column(Float, nullable=True)
    experience_match_score = Column(Float, nullable=True)
    overall_match_score = Column(Float, nullable=True)
    
    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    job = relationship("Job", backref="applications")
    student = relationship("User", backref="applications")
