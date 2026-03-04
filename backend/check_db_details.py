import os
import requests
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

def check_db():
    print("--- Database Internal Check ---")
    url = os.getenv("DATABASE_URL")
    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            # Check for tables
            rs = conn.execute(text("SELECT COUNT(id) FROM users"))
            print(f"Total Users: {rs.scalar()}")
            
            # Check for jobs
            rs = conn.execute(text("SELECT COUNT(id) FROM jobs"))
            job_count = rs.scalar()
            print(f"Total Jobs in System: {job_count}")
            
            if job_count > 0:
                rs = conn.execute(text("SELECT title, is_active FROM jobs LIMIT 5"))
                print("Recent Jobs:")
                for r in rs:
                    print(f" - {r[0]} (Active: {r[1]})")
            else:
                print("⚠️ No Jobs found in database. Student Dashboard will be empty until a teacher posts.")
            
            # Check for teacher profiles
            rs = conn.execute(text("SELECT COUNT(id) FROM teacher_profiles"))
            print(f"Total Teacher Profiles: {rs.scalar()}")

    except Exception as e:
        print(f"DB Error: {e}")

if __name__ == "__main__":
    check_db()
