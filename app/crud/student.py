
from sqlalchemy.orm import Session
from app.models.student import StudentProfile
from app.schemas.student import StudentProfileCreate, StudentProfileUpdate

def get_student_profile(db: Session, user_id: int):
    return db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()

def create_student_profile(db: Session, profile: StudentProfileCreate, user_id: int):
    # Using model_dump() for Pydantic v2
    db_profile = StudentProfile(**profile.model_dump(), user_id=user_id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def update_student_profile(db: Session, db_profile: StudentProfile, profile_update: StudentProfileUpdate):
    update_data = profile_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_profile, key, value)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile
