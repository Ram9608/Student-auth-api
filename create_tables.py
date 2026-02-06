from app.core.database import engine, Base
from app.models import User, StudentProfile, Job, UsedToken, JobApplication
from app.models.enhanced_models import Application, ResumeVersion, CourseProgress, RecommendationLog, TeacherAnalytics, EmailNotification

print("Creating all tables...")
Base.metadata.create_all(bind=engine)
print("Done!")
