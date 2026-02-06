
print("Stage 1")
from app.core.database import SessionLocal
print("Stage 2")
from app.models.user import User
print("Stage 3")
from app.models.student import StudentProfile
print("Stage 4")
from app.models.job import Job
print("Stage 5")
from app.services.resume_analyzer import ResumeAnalyzerService
print("Stage 6")
