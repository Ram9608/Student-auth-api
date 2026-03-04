import sys
import os
import secrets
from fastapi.testclient import TestClient
from fpdf import FPDF

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
from app.main import app

client = TestClient(app)

def create_dummy_pdf(filepath):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="John Doe - Resume", ln=1, align='C')
    pdf.cell(200, 10, txt="Skills: Python, FastAPI, Machine Learning, PostgreSQL", ln=2)
    pdf.cell(200, 10, txt="Experience: 3 years building AI platforms.", ln=3)
    pdf.output(filepath)

def test_phase_6_resumes():
    print("==========================================")
    print("STARTING TEST FOR PHASE-6 (RESUME UPLOAD)")
    print("==========================================")
    
    student_email = f"student_{secrets.token_hex(4)}@test.com"
    teacher_email = f"teacher_{secrets.token_hex(4)}@test.com"
    password = "SecurePassword123"

    # 1. Signup and Get Tokens
    client.post("/auth/signup", json={"full_name": "Test Student", "email": student_email, "password": password, "role": "student"})
    client.post("/auth/signup", json={"full_name": "Test Teacher", "email": teacher_email, "password": password, "role": "teacher"})

    student_token = client.post("/auth/login", json={"email": student_email, "password": password}).json().get("access_token")
    teacher_token = client.post("/auth/login", json={"email": teacher_email, "password": password}).json().get("access_token")

    student_headers = {"Authorization": f"Bearer {student_token}"}
    teacher_headers = {"Authorization": f"Bearer {teacher_token}"}
    
    # 2. Setup dummy files
    dummy_pdf_path = "dummy_resume.pdf"
    dummy_txt_path = "dummy_resume.txt"
    create_dummy_pdf(dummy_pdf_path)
    with open(dummy_txt_path, "w") as f:
        f.write("Aise hi txt file hai, not allow honi chahiye.")

    # 3. Resume Upload (As Teacher -> Should Fail)
    print("\n--- Testing Upload as Teacher ---")
    with open(dummy_pdf_path, "rb") as f:
        res = client.post("/resumes/upload", files={"file": ("dummy_resume.pdf", f, "application/pdf")}, headers=teacher_headers)
    print("POST /resumes/upload (Teacher) -> Expected 403, Got:", res.status_code)
    
    # 4. Resume Upload Non-PDF (As Student -> Should Fail)
    print("\n--- Testing Upload Non-PDF ---")
    with open(dummy_txt_path, "rb") as f:
        res = client.post("/resumes/upload", files={"file": ("dummy_resume.txt", f, "text/plain")}, headers=student_headers)
    print("POST /resumes/upload (.txt) -> Expected 400, Got:", res.status_code)

    # 5. Resume Upload VALID PDF (As Student -> Should Pass)
    print("\n--- Testing Upload Valid PDF ---")
    with open(dummy_pdf_path, "rb") as f:
        res = client.post("/resumes/upload", files={"file": ("dummy_resume.pdf", f, "application/pdf")}, headers=student_headers)
    
    print("POST /resumes/upload (.pdf) -> Status:", res.status_code)
    if res.status_code == 200:
        data = res.json()
        print("[OK] Resume successfully uploaded!")
        print("-> DB ID:", data.get("id"))
        print("-> File Path:", data.get("file_path"))
        print("-> Extracted Text Preview:", data.get("extracted_text")[:50] + "...")
        assert "uploads/resumes" in data.get("file_path")
        assert "Python" in data.get("extracted_text")
    else:
        print("[FAIL]", res.json())

    # Cleanup
    os.remove(dummy_pdf_path)
    os.remove(dummy_txt_path)

if __name__ == "__main__":
    test_phase_6_resumes()
