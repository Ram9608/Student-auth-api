from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="applied") # applied, reviewed, shortlisted, rejected
    rejection_reason = Column(String, nullable=True)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    job = relationship("Job", backref="applications")
    student = relationship("User", backref="applications")
