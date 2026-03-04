import sys
import os
import secrets
from fastapi.testclient import TestClient

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
from app.main import app
from app.database import engine, Base

client = TestClient(app)

def test_phase_4_jobs():
    print("==========================================")
    print("STARTING TEST FOR PHASE-4 (JOBS CRUD)")
    print("==========================================")
    
    # 🚨 DEV ONLY: Drop and recreate tables to apply schema changes (like new teacher_id and skills_required columns)
    # WARNING: This erases previous data in local testing DB
    print("[INFO] Rebuilding database tables to apply Job schema changes...")
    # Moved to rebuild_db.py to avoid TestClient conflicts
    print("[INFO] Ensure rebuild_db.py is executed before running this test.\n")

    teacher_email = f"teacher_{secrets.token_hex(4)}@test.com"
    student_email = f"student_{secrets.token_hex(4)}@test.com"
    another_teacher = f"teacher2_{secrets.token_hex(4)}@test.com"
    password = "SecurePassword123"

    # 1. Signup and Get Tokens
    client.post("/auth/signup", json={"full_name": "Test Teacher", "email": teacher_email, "password": password, "role": "teacher"})
    client.post("/auth/signup", json={"full_name": "Test Student", "email": student_email, "password": password, "role": "student"})
    client.post("/auth/signup", json={"full_name": "Bad Teacher", "email": another_teacher, "password": password, "role": "teacher"})

    teacher_token = client.post("/auth/login", json={"email": teacher_email, "password": password}).json().get("access_token")
    student_token = client.post("/auth/login", json={"email": student_email, "password": password}).json().get("access_token")
    teacher2_token = client.post("/auth/login", json={"email": another_teacher, "password": password}).json().get("access_token")

    teacher_headers = {"Authorization": f"Bearer {teacher_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}
    teacher2_headers = {"Authorization": f"Bearer {teacher2_token}"}

    # 2. CREATE JOB (Teacher)
    job_payload = {
        "title": "Python Backend Developer",
        "description": "FastAPI + PostgreSQL project for modern AI apps",
        "skills_required": "Python, FastAPI, PostgreSQL, JWT"
    }
    
    print("\n--- Testing Job Creation (Teacher Only) ---")
    res = client.post("/jobs/", json=job_payload, headers=teacher_headers)
    print("POST /jobs (As Teacher) -> Status:", res.status_code)
    job_id = None
    if res.status_code == 200:
        job_data = res.json()
        job_id = job_data["id"]
        print("[OK] Job successfuly created by Teacher! ID:", job_id)
    else:
        print("[FAIL] Teacher could not create job.", res.json())

    # 3. CREATE JOB (Student - Should Fail)
    res = client.post("/jobs/", json=job_payload, headers=student_headers)
    print("\nPOST /jobs (As Student) -> Status:", res.status_code)
    if res.status_code in [401, 403]:
        print("[OK] Student blocked from creating job.")
    else:
        print("[FAIL] Student was able to create job!", res.json())

    # 4. VIEW JOBS (Public/Anyone)
    print("\n--- Testing Public Job Listing ---")
    res = client.get("/jobs/")
    print("GET /jobs (No Token) -> Status:", res.status_code)
    if res.status_code == 200 and len(res.json()) > 0:
        print("[OK] Public can see job listings. Total found:", len(res.json()))
    else:
        print("[FAIL] Public job listing not working or empty.")

    # 5. DELETE JOB (By Another Teacher - Should Fail)
    print("\n--- Testing Secure Job Deletion ---")
    res = client.delete(f"/jobs/{job_id}", headers=teacher2_headers)
    print("DELETE /jobs (By different teacher) -> Status:", res.status_code)
    if res.status_code == 403:
         print("[OK] Blocked 'Not your job' rule worked.")
         
    # 6. DELETE JOB (By Actual Teacher - Should Pass)
    res = client.delete(f"/jobs/{job_id}", headers=teacher_headers)
    print("DELETE /jobs (By job owner teacher) -> Status:", res.status_code)
    if res.status_code == 200:
         print("[OK] Teacher deleted their own job successfully.")

    # Verify Deletion
    remaining = client.get("/jobs/").json()
    if len(remaining) == 0:
         print("[OK] Job table is empty again.")

if __name__ == "__main__":
    test_phase_4_jobs()
