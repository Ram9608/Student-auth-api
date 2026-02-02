
from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    education = Column(String, nullable=True)
    skills = Column(JSON, nullable=True) # Supported by SQLite (via string) and Postgres
    preferred_job_role = Column(String, nullable=True)
    experience_level = Column(String, nullable=True)
    
    # --- New Fields ---
    resume_path = Column(String, nullable=True)
    city_state = Column(String, nullable=True)
    education_details = Column(JSON, nullable=True) # [{degree, institute, year}]
    projects = Column(JSON, nullable=True) # [{title, description, link}]
    experience_details = Column(JSON, nullable=True) # [{company, role, duration}]
    github_link = Column(String, nullable=True)
    linkedin_link = Column(String, nullable=True)
    fresher_status = Column(String, nullable=True) # Fresher / Experienced
    availability = Column(String, nullable=True)
    work_authorization = Column(String, nullable=True)
    expected_salary = Column(String, nullable=True)

    user = relationship("User", back_populates="student_profile")
