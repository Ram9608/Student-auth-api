import sys
import os
import secrets
from fastapi.testclient import TestClient

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
from app.main import app

client = TestClient(app)

def test_phase_3_authorization():
    print("==========================================")
    print("STARTING TEST FOR PHASE-3 (AUTHORIZATION)")
    print("==========================================")
    
    # Random Emails banaye to keep fresh test data per run
    teacher_email = f"teacher_{secrets.token_hex(4)}@test.com"
    student_email = f"student_{secrets.token_hex(4)}@test.com"
    password = "SecurePassword123"

    print("\n[Teacher Signup]")
    res = client.post("/auth/signup", json={"full_name": "Test Teacher", "email": teacher_email, "password": password, "role": "teacher"})
    print("Status:", res.status_code)

    print("\n[Student Signup]")
    res = client.post("/auth/signup", json={"full_name": "Test Student", "email": student_email, "password": password, "role": "student"})
    print("Status:", res.status_code)

    # Teachers Login get JWT
    print("\n[Teacher Login for JWT]")
    res = client.post("/auth/login", json={"email": teacher_email, "password": password})
    teacher_token = res.json().get("access_token")
    if teacher_token:
        print("[OK] Teacher JWT received.")
    else:
        print("[FAIL] Teacher Login failed.")
        return

    # Students Login get JWT
    print("\n[Student Login for JWT]")
    res = client.post("/auth/login", json={"email": student_email, "password": password})
    student_token = res.json().get("access_token")
    if student_token:
        print("[OK] Student JWT received.")
    else:
        print("[FAIL] Student Login failed.")
        return

    # TESTING
    print("\n--- Testing Teacher Token ---")
    headers = {"Authorization": f"Bearer {teacher_token}"}
    
    # /protected/me (Teacher should pass)
    res = client.get("/protected/me", headers=headers)
    print("GET /protected/me -> Status:", res.status_code, "Body:", res.json())
    
    # /protected/teacher-dashboard (Teacher should pass)
    res = client.get("/protected/teacher-dashboard", headers=headers)
    print("GET /protected/teacher-dashboard -> Status:", res.status_code)
    
    # /protected/student-dashboard (Teacher should FAIL - 403 Forbidden)
    res = client.get("/protected/student-dashboard", headers=headers)
    print("GET /protected/student-dashboard -> Expected 403, Got:", res.status_code)

    print("\n--- Testing Student Token ---")
    headers = {"Authorization": f"Bearer {student_token}"}
    
    # /protected/teacher-dashboard (Student should FAIL - 403 Forbidden)
    res = client.get("/protected/teacher-dashboard", headers=headers)
    print("GET /protected/teacher-dashboard -> Expected 403, Got:", res.status_code)
    
    # /protected/student-dashboard (Student should pass)
    res = client.get("/protected/student-dashboard", headers=headers)
    print("GET /protected/student-dashboard -> Status:", res.status_code)

    print("\n--- Testing Invalid Token ---")
    headers = {"Authorization": f"Bearer JUNGLE_TOKEN_MAN_123"}
    res = client.get("/protected/me", headers=headers)
    print("GET /protected/me with fake token -> Expected 401, Got:", res.status_code, res.json())
    

if __name__ == "__main__":
    test_phase_3_authorization()
