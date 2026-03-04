from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

# 1️⃣ SIGNUP API (Endpoint to register a new user account)
@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    # First, verify if a user with the same email already exists in the database.
    existing = db.query(User).filter(User.email == user.email).first()
    
    # If email is already in use, return a 400 error and abort registration.
    if existing:
        raise HTTPException(status_code=400, detail="This email is already registered!")

    # Initialize a new User instance using the SQLAlchemy model.
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        # 🔑 Security Note: We never store plain-text passwords. Hashing is performed for data integrity.
        hashed_password=hash_password(user.password),  
        role=user.role
    )

    db.add(new_user) # Add the object to the session to prepare for transaction
    db.commit()      # Persist the data into the PostgreSQL table
    db.refresh(new_user) # Refresh the model instance to include auto-generated fields like IDs

    return {"message": "Success! Your account has been created successfully."}

# 2️⃣ LOGIN API (Endpoint to validate credentials and generate a secure JWT token)
@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    # Query the database to retrieve the user record matching the provided email.
    user = db.query(User).filter(User.email == data.email).first()

    # Perform a null check and verify the hashed password using the security utility.
    if not user or not verify_password(data.password, user.hashed_password):
        # Return a 401 Unauthorized status if verification fails.
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # On successful validation, generate a JWT token including the user identity and role.
    token = create_access_token({
        "user_id": user.id,
        "role": user.role
    })

    # Return the token to the frontend to be stored in the session or local storage for authentication.
    return {"access_token": token, "token_type": "bearer"}


# 3️⃣ FORGOT PASSWORD (Email link logic placeholder)
import aiosmtplib
from email.message import EmailMessage
from app.config import settings

@router.post("/forgot-password")
async def forgot_password(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="This email is not registered.")
    
    # Create a short-lived JWT token (15 min expiry) for password reset
    token = create_access_token(
        data={"sub": email, "type": "password_reset"}, 
        expires_minutes=15
    )
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{token}"
    
    # Use central email utility
    from app.utils.email_utils import send_email
    email_sent, smtp_error = await send_email(
        to_email=email,
        subject="AI Platform - Password Reset Request",
        content=f"Click the link below to reset your password (expires in 15 minutes):\n\n{reset_link}\n\nIf you did not request this, please ignore this email."
    )

    if email_sent:
        return {"message": "Reset link successfully sent to your email 📩", "link": reset_link}
    else:
        # Still return the link so the user can reset even if email fails
        return {
            "message": f"Email could not be sent ({smtp_error}). Use the link below to reset your password.",
            "link": reset_link
        }


# 4️⃣ RESET PASSWORD (JWT Verified logic)
from jose import jwt, JWTError

@router.post("/reset-password/{token}")
def reset_password(token: str, data: dict, db: Session = Depends(get_db)):
    try:
        # Decode and verify token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if payload.get("type") != "password_reset" or not email:
            raise HTTPException(status_code=401, detail="Invalid token type.")
            
    except JWTError:
        raise HTTPException(status_code=401, detail="The reset link is invalid or has expired.")

    new_password = data.get("password")
    if not new_password:
        raise HTTPException(status_code=400, detail="Please provide a new password.")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User record not found.")
    
    user.hashed_password = hash_password(new_password)
    db.commit()
    return {"message": "Password Updated ✅"}
