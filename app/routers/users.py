
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
import os
import shutil
from app.schemas.user import UserResponse
from app.schemas.student import StudentProfileResponse, StudentProfileUpdate, StudentProfileCreate
from app.models.user import User
from app.routers.deps import get_current_user, RoleChecker
from app.core.database import get_db
from app.crud import student as crud_student

router = APIRouter(prefix="/student", tags=["Student"])

# Only students can access
allow_student = RoleChecker(["student"])

@router.post("/resume", dependencies=[Depends(allow_student)])
async def upload_resume(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"DEBUG: Resume upload request received from user_id: {current_user.id}")
    
    # 1. Basic Validation
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")
    
    if not file.filename.lower().endswith(".pdf"):
        print(f"DEBUG: Invalid file extension: {file.filename}")
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # 2. Size Validation (Max 2MB)
    MAX_SIZE = 2 * 1024 * 1024
    try:
        content = await file.read()
        file_size = len(content)
        if file_size > MAX_SIZE:
            print(f"DEBUG: File too large: {file_size} bytes")
            raise HTTPException(status_code=400, detail="File size too large (Max 2MB)")
    except Exception as e:
        print(f"DEBUG: Error reading file: {str(e)}")
        raise HTTPException(status_code=400, detail="Could not process file")

    # 3. Path Setup
    # Use absolute path to avoid directory issues on Windows
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    upload_dir = os.path.join(base_dir, "uploads", "resumes")
    
    try:
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir, exist_ok=True)
            print(f"DEBUG: Created directory: {upload_dir}")
    except Exception as e:
        print(f"DEBUG: Directory creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Server storage error")

    # 4. Save File
    filename = f"resume_{current_user.id}.pdf"
    file_path = os.path.join(upload_dir, filename)
    
    try:
        with open(file_path, "wb") as f:
            f.write(content)
        print(f"DEBUG: File saved successfully to: {file_path}")
    except Exception as e:
        print(f"DEBUG: File write failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save file")

    # 5. Database Update
    try:
        relative_url = f"/uploads/resumes/{filename}"
        db_profile = crud_student.get_student_profile(db, current_user.id)
        
        if not db_profile:
            # Create minimal profile if it doesn't exist
            print("DEBUG: Profile not found, creating minimal profile")
            crud_student.create_student_profile(db, StudentProfileCreate(), current_user.id)
            db_profile = crud_student.get_student_profile(db, current_user.id)
        
        # Update specifically the resume_path
        # Note: StudentProfileUpdate(resume_path=relative_url) creates a schema with only resume_path set
        crud_student.update_student_profile(db, db_profile, StudentProfileUpdate(resume_path=relative_url))
        print(f"DEBUG: Database updated with path: {relative_url}")
        
    except Exception as e:
        print(f"DEBUG: Database update failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update profile record")

    return {
        "success": True,
        "message": "Resume uploaded successfully",
        "resume_path": relative_url
    }

# Only students can access
allow_student = RoleChecker(["student"])

@router.get("/me", response_model=UserResponse, dependencies=[Depends(allow_student)])
def get_student_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/profile", response_model=StudentProfileResponse, dependencies=[Depends(allow_student)])
def get_student_details(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = crud_student.get_student_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please create one.")
    return profile

@router.post("/profile", response_model=StudentProfileResponse, dependencies=[Depends(allow_student)])
def create_profile(profile: StudentProfileCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing_profile = crud_student.get_student_profile(db, current_user.id)
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists")
    return crud_student.create_student_profile(db, profile, current_user.id)

@router.put("/profile", response_model=StudentProfileResponse, dependencies=[Depends(allow_student)])
def update_profile(profile: StudentProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_profile = crud_student.get_student_profile(db, current_user.id)
    if not db_profile:
        # Auto-create if not exists (Upsert)
        return crud_student.create_student_profile(db, StudentProfileCreate(**profile.model_dump()), current_user.id)
    
    return crud_student.update_student_profile(db, db_profile, profile)
