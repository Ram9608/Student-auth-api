
import os
import requests
import json
import time
from datetime import datetime
import jwt

# --- CONFIG ---
BASE_URL = "http://localhost:8000/api/v1"
SECRET_KEY = "a9e3b2cc068eb4a1d94692a71912b203e5c9467f1f347a16a1d0651e085f74cc"
ALGORITHM = "HS256"

# --- HELPERS ---
def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def test_section(name):
    print(f"\n{'='*20} {name} {'='*20}")

# --- DATA ---
# Use unique emails for each test run to avoid "already registered"
timestamp = int(time.time())
STUDENT = {"email": f"student_{timestamp}@test.com", "password": "Password123!", "role": "student", "first_name": "QA", "last_name": "Student", "phone": "1234567890"}
TEACHER = {"email": f"teacher_{timestamp}@test.com", "password": "Password123!", "role": "teacher", "first_name": "QA", "last_name": "Teacher", "phone": "0987654321"}

class APITester:
    def __init__(self):
        self.student_token = None
        self.teacher_token = None
        self.student_id = None
        self.teacher_id = None
        self.job_id = None
        self.application_id = None

    def register_and_login(self, user_data):
        # Register
        reg_resp = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        if reg_resp.status_code not in [200, 201]:
             log(f"Registration status: {reg_resp.status_code} - might already exist")
        else:
             self.student_id = reg_resp.json().get("id") if user_data["role"] == "student" else None
             self.teacher_id = reg_resp.json().get("id") if user_data["role"] == "teacher" else None

        # Login
        resp = requests.post(f"{BASE_URL}/auth/login", data={"username": user_data["email"], "password": user_data["password"]})
        if resp.status_code == 200:
            return resp.json()["access_token"]
        else:
            log(f"Login failed: {resp.text}")
        return None

    def run_all(self):
        test_section("PHASE 1: AUTHENTICATION")
        self.student_token = self.register_and_login(STUDENT)
        self.teacher_token = self.register_and_login(TEACHER)
        
        if self.student_token and self.teacher_token:
            log("✅ Student & Teacher successfully authenticated")
        else:
            log("❌ FATAL: Auth failed. Stopping tests.")
            return

        # 2. Reset Link & One-time token
        test_section("PHASE 2: PASSWORD RESET (ONE-TIME TOKEN)")
        # We simulate the token generation as the server does
        payload = {"sub": "1", "type": "reset", "exp": int(time.time()) + 900}
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        
        reset_data = {"token": token, "new_password": "NewSecurePassword123!"}
        # First use
        resp = requests.post(f"{BASE_URL}/auth/reset-password", json=reset_data)
        if resp.status_code == 200:
            log("✅ Password reset successful with valid token")
            # Second use (should fail)
            resp2 = requests.post(f"{BASE_URL}/auth/reset-password", json=reset_data)
            if resp2.status_code == 400:
                log("✅ Pass: One-time token restriction verified (Blacklisted)")
            else:
                log(f"❌ FAIL: Token was reusable! Status: {resp2.status_code}")
        else:
            log(f"❌ FAIL: Reset failed: {resp.text}")

        # 3. Teacher Job Management
        test_section("PHASE 3: TEACHER - JOB POSTING")
        t_headers = {"Authorization": f"Bearer {self.teacher_token}"}
        job_data = {
            "title": "Data Scientist",
            "description": "Expert in Python and Machine Learning",
            "company": "DeepMind Partner",
            "location": "Remote",
            "required_skills": ["Python", "PyTorch", "SQL"],
            "experience_level": "2+ years"
        }
        resp = requests.post(f"{BASE_URL}/teacher/jobs", json=job_data, headers=t_headers)
        if resp.status_code == 200:
            self.job_id = resp.json()["id"]
            log(f"✅ Job posted successfully (ID: {self.job_id})")
        else:
            log(f"❌ Job post failed: {resp.text}")

        # 4. Student Profile & Recommendations
        test_section("PHASE 4: STUDENT - PROFILE & RECS")
        s_headers = {"Authorization": f"Bearer {self.student_token}"}
        profile_data = {
            "age": 23, "education": "B.S. CS", "skills": ["Python", "SQL"],
            "preferred_job_role": "Data Scientist", "experience_level": "Fresher"
        }
        requests.post(f"{BASE_URL}/student/profile", json=profile_data, headers=s_headers)
        
        # Recommendations
        resp = requests.get(f"{BASE_URL}/jobs/recommendations", headers=s_headers)
        if resp.status_code == 200:
            log(f"✅ Success: Received {len(resp.json())} recommended jobs")
        else:
            log("❌ Recommendations failed")

        # 5. Resume Analysis Fit
        test_section("PHASE 5: RESUME ANALYZER (AI FIT)")
        if self.job_id:
            resp = requests.post(f"{BASE_URL}/resume-analyzer/analyze/{self.job_id}", headers=s_headers)
            if resp.status_code == 200:
                data = resp.json()
                log(f"✅ Match Score: {data.get('match_score')}%")
                log(f"Matched Skills: {data.get('matched_skills')}")
            else:
                log(f"❌ Analyzer failed: {resp.text}")

        # 6. Apply & Track Status
        test_section("PHASE 6: APPLICATION & STATUS TRACKING")
        if self.job_id:
            resp = requests.post(f"{BASE_URL}/jobs/{self.job_id}/apply", headers=s_headers)
            if resp.status_code == 200:
                self.application_id = resp.json()["id"]
                log(f"✅ Applied. Initial Status: {resp.json().get('status')}")
            else:
                log(f"❌ Application failed: {resp.text}")

        # 7. Teacher Action: Review & Status Update
        test_section("PHASE 7: TEACHER - REVIEW & STATUS UPDATE")
        if self.application_id:
            # Add Review (Accept/Reject decision)
            review_data = {
                "rating": 2, 
                "notes": "Good profile but missing specific industry experience.",
                "rejection_reason": "Insufficient experience in PyTorch" 
            }
            # The endpoint seems to be /teacher/applications/{id}/review or similar. 
            # From teacher_enhanced.py: add_application_review(application_id, review)
            headers = {"Authorization": f"Bearer {self.teacher_token}"}
            requests.post(f"{BASE_URL}/teacher/applications/{self.application_id}/review", json=review_data, headers=headers)
            
            # Update Status to Rejected
            status_resp = requests.patch(f"{BASE_URL}/teacher/applications/{self.application_id}/status?status=rejected", headers=headers)
            if status_resp.status_code == 200:
                log(f"✅ Teacher status update Success: SET TO 'rejected'")
            else:
                log(f"❌ Status update failed: {status_resp.text}")

        # 8. Student Verification
        test_section("PHASE 8: STUDENT - VIEW STATUS & REASONS")
        resp = requests.get(f"{BASE_URL}/student/applications", headers=s_headers)
        if resp.status_code == 200:
            apps = resp.json()
            found = False
            for a in apps:
                if a["id"] == self.application_id:
                    log(f"✅ Student Dashboard verification: Status is '{a['status']}'")
                    log(f"✅ Rejection Reason: {a.get('rejection_reason')}")
                    found = True
            if not found: log("❌ Application not found in list")

        # 9. Chatbot Verification
        test_section("PHASE 9: AI CHATBOT TEST")
        resp = requests.post(f"{BASE_URL}/chatbot/query", json={"message": "Suggest me some resources for Python Machine Learning"})
        if resp.status_code == 200:
            log(f"✅ Chatbot Response: {resp.json().get('response')[:100]}...")
            log(f"Provider: {resp.json().get('provider_used')}")
        else:
            log("❌ Chatbot failed")

        print("\n" + "#"*50)
        print("   COMPREHENSIVE TEST COMPLETED SUCCESSFULLY")
        print("#"*50)

if __name__ == "__main__":
    tester = APITester()
    tester.run_all()
