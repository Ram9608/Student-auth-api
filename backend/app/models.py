from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # 'student' or 'teacher'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    jobs = relationship("Job", back_populates="teacher")
    applications = relationship("Application", back_populates="student")
    profile = relationship("StudentProfile", back_populates="user", uselist=False)
    teacher_profile = relationship("TeacherProfile", back_populates="user", uselist=False)


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)

    # Basic Info
    mobile = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    experience_type = Column(String(20), default="fresher")  # fresher / experienced
    availability = Column(String(100), nullable=True)
    work_authorization = Column(Boolean, default=True)
    expected_salary = Column(String(50), nullable=True)

    # Education
    degree = Column(String(100), nullable=True)
    college = Column(String(200), nullable=True)
    passing_year = Column(String(10), nullable=True)
    cgpa = Column(String(10), nullable=True)

    # Skills
    technical_skills = Column(Text, nullable=True)   # comma separated
    soft_skills = Column(Text, nullable=True)         # comma separated

    # Projects (stored as JSON string)
    projects = Column(Text, nullable=True)

    # Internships (stored as JSON string)
    internships = Column(Text, nullable=True)

    # Links
    github = Column(String(300), nullable=True)
    linkedin = Column(String(300), nullable=True)
    portfolio = Column(String(300), nullable=True)

    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="profile")


class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)

    mobile = Column(String(20), nullable=True)
    designation = Column(String(100), nullable=True)   # Teacher / Recruiter / HR
    department = Column(String(200), nullable=True)    # Dept / Company
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="teacher_profile")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    skills_required = Column(String(300), nullable=False)
    experience_required = Column(String(50), nullable=True, default="fresher")
    job_type = Column(String(50), nullable=True, default="full-time")
    location_type = Column(String(50), nullable=True, default="remote")
    salary = Column(String(100), nullable=True)
    last_date = Column(String(30), nullable=True)
    is_active = Column(Boolean, default=True)

    teacher_id = Column(Integer, ForeignKey("users.id"), index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    teacher = relationship("User", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), index=True)
    student_id = Column(Integer, ForeignKey("users.id"), index=True)
    status = Column(String, default="applied")  # 'applied', 'under review', 'accepted', 'rejected'
    test_date = Column(String(50), nullable=True)     # Date for the online test
    test_time = Column(String(50), nullable=True)     # Time slot
    test_info = Column(Text, nullable=True)           # Instructions/Link for the test
    reason = Column(Text, nullable=True)              # Feedback or rejection rationale
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="applications")
    student = relationship("User", back_populates="applications")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    # 🔗 Each resume is linked to a specific authenticated student via their unique ID.
    student_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    # Path to the physical file stored in the local file system.
    file_path = Column(String(300), nullable=False)
    
    # Upon upload, the PDF content is extracted and persisted here for database-level search and ML matching.
    extracted_text = Column(Text, nullable=True)

# ===============================
# 🤖 PHASE-10: VISION MODELS
# ===============================

class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    embedding_json = Column(Text)  # JSON string of the face vector (embedding layer)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    method = Column(String, default="face_recognition") # Manual, Face, QR etc.

class VisionLog(Base):
    """
    Unified telemetry table for persisting Emotion, Activity (Fall), and Security alerts.
    Designed for efficient dashboard data visualization and behavioral analytics.
    """
    __tablename__ = "vision_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    log_type = Column(String)  # 'emotion', 'activity', 'security_alert'
    content = Column(String)   # 'Happy', 'Fall Detected', 'Mobile In Proctored Zone'
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), index=True)
    title = Column(String(200), nullable=False)
    questions = Column(Text)  # JSON string of questions
    duration = Column(Integer)  # in minutes
    monitoring_required = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), index=True)
    student_id = Column(Integer, ForeignKey("users.id"), index=True)
    score = Column(Integer)
    warnings_count = Column(Integer, default=0)
    feedback = Column(Text, nullable=True)
    is_published = Column(Boolean, default=False)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
