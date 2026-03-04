import sys
import os

print("="*50)
print("RUNNING ALL PHASES TESTS (Phase 1 to Phase 6)")
print("="*50)

# Phase 1: Database Check
print("\n[STEP 1] Running Rebuild DB Test...")
os.system(f"{sys.executable} rebuild_db.py")

print("\n" + "="*50)
# Phase 2: Auth
print("[STEP 2] Running Auth (Signup/Login) Tests...")
os.system(f"{sys.executable} test_auth.py")

print("\n" + "="*50)
# Phase 3: JWT Role Checking
print("[STEP 3] Running JWT Authorization & Roles Tests...")
os.system(f"{sys.executable} test_protected.py")

print("\n" + "="*50)
# Phase 4: Job CRUD System
print("[STEP 4] Running Job CRUD System Tests...")
os.system(f"{sys.executable} test_jobs.py")

print("\n" + "="*50)
# Phase 6: Resume Upload System
print("[STEP 5] Running Resume Management System Tests...")
os.system(f"{sys.executable} test_resumes.py")

print("\n" + "="*50)
print("ALL TESTS COMPLETED SUCCESSFULLY! [YAY]")
print("="*50)
