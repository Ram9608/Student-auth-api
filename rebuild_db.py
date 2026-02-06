from app.core.database import engine, Base
from sqlalchemy import text

# Drop tables that might have conflicts or need updates
tables_to_drop = ["applications", "job_applications"]

with engine.connect() as conn:
    for table in tables_to_drop:
        try:
            conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
            print(f"Dropped {table}")
        except Exception as e:
            print(f"Error dropping {table}: {e}")
    conn.commit()

# Recreate all tables
from app.models import User, Job, JobApplication
from app.models.enhanced_models import ResumeVersion, CourseProgress, RecommendationLog, TeacherAnalytics, EmailNotification

Base.metadata.create_all(bind=engine)
print("Tables recreated successfully")
