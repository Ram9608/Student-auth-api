"""
Database Migration Script for Enhanced Features

Run this script to add new tables to your existing database.
This is a one-time migration that won't affect existing data.
"""

from sqlalchemy import create_engine
from app.core.database import SQLALCHEMY_DATABASE_URL, Base
from app.models.enhanced_models import (
    Application, ResumeVersion, CourseProgress,
    RecommendationLog, TeacherAnalytics, EmailNotification
)

def run_migration():
    """Create new tables for enhanced features"""
    print("🔄 Starting database migration for enhanced features...")
    
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    try:
        # Create only the new tables (won't affect existing ones)
        Base.metadata.create_all(bind=engine, checkfirst=True)
        
        print("✅ Migration completed successfully!")
        print("\nNew tables created:")
        print("  - applications")
        print("  - resume_versions")
        print("  - course_progress")
        print("  - recommendation_logs")
        print("  - teacher_analytics")
        print("  - email_notifications")
        
        print("\n📝 Next steps:")
        print("  1. Restart your FastAPI server")
        print("  2. Test endpoints at http://localhost:8000/docs")
        print("  3. Check ENHANCED_FEATURES_GUIDE.md for API documentation")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("\nTroubleshooting:")
        print("  - Ensure your database is running")
        print("  - Check database connection in .env file")
        print("  - Verify no table name conflicts")

if __name__ == "__main__":
    run_migration()
