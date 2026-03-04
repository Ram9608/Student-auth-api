import sys
import os
import secrets

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_signup_and_login():
    random_email = f"testuser_{secrets.token_hex(4)}@example.com"
    print("------------------------------------------")
    print(f"Bhai, test shuru kar rahe hain is email se: {random_email}")
    
    # 1. Test Signup
    signup_data = {
        "full_name": "Test Student",
        "email": random_email,
        "password": "SecurePassword123",
        "role": "student"
    }
    
    response = client.post("/auth/signup", json=signup_data)
    print("Signup Status Code:", response.status_code)
    print("Signup Response:", response.json())
    
    if response.status_code != 200:
        print("[FAIL] Signup fail ho gaya bhai.")
        return False
    else:
        print("[OK] Signup working - DB mein naya user ban gaya!")
        
    # 2. Test Login
    login_data = {
        "email": random_email,
        "password": "SecurePassword123"
    }
    
    response = client.post("/auth/login", json=login_data)
    print("Login Status Code:", response.status_code)
    print("Login Response:", response.json())
    
    if response.status_code == 200 and "access_token" in response.json():
        print("[OK] Login working - JWT Token ban gaya!")
        token = response.json()["access_token"]
        print(f"Token ka sample: {token[:30]}... (Secret Security Pass)")
        return True
    else:
        print("[FAIL] Login me dikkat hai.")
        return False

if __name__ == "__main__":
    test_signup_and_login()
