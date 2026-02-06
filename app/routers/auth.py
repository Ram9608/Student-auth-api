
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timezone
from typing import Optional
import os
import jwt
from jwt.exceptions import InvalidTokenError

from app.core.database import get_db
from app.models.user import User
from app.models.used_token import UsedToken
from app.schemas.user import UserCreate, UserResponse, Token, PasswordResetRequest, PasswordReset
from app.crud import user as crud_user
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import settings
from app.services.email import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if email exists
        db_user = crud_user.get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        new_user = crud_user.create_user(db, user)
        return new_user
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Registration Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        # Fetch user
        user = crud_user.get_user_by_email(db, email=form_data.username)
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")

        # Create token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role},
            expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.post("/forgot-password")
def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    user = crud_user.get_user_by_email(db, email=request.email)
    
    if user:
        reset_token = create_access_token(
            data={"sub": str(user.id), "type": "reset"},
            expires_delta=timedelta(minutes=15)
        )
        frontend_url = settings.FRONTEND_URL
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        
        # Send email
        email_sent = send_password_reset_email(user.email, reset_link)
        
        if email_sent:
            print(f"Password reset email sent to: {user.email}")
        else:
            print(f"⚠️  Email sending failed. Reset link: {reset_link}")
    
    # Always return same message for security
    return {
        "message": "If this email is registered, you will receive a password reset link.",
        "success": True
    }

@router.post("/reset-password")
def reset_password(reset_data: PasswordReset, db: Session = Depends(get_db)):
    # 1. Check if this token has already been used (Explicit DB check)
    already_used = db.query(UsedToken).filter(UsedToken.token == reset_data.token).first()
    if already_used:
        print(f"DEBUG: Token already exists in used_tokens table.")
        raise HTTPException(status_code=400, detail="This reset link has already been used.")

    try:
        payload = jwt.decode(reset_data.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_exp": True}, leeway=10)
        user_id = payload.get("sub")
        token_type = payload.get("type")
        
        if user_id is None or token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token structure")
            
        user_id = int(user_id)
            
    except InvalidTokenError as e:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 2. Update Password
    user.hashed_password = get_password_hash(reset_data.new_password)
    user.last_reset_at = datetime.now(timezone.utc)
    
    # 3. Save token to UsedTokens table (Blacklist)
    new_used_token = UsedToken(token=reset_data.token)
    db.add(new_used_token)
    
    db.commit()
    print(f"Password reset successful and token blacklisted.")
    return {"message": "Password reset successfully"}

from app.routers.deps import get_current_user

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current user information (works for both students and teachers)
    """
    return current_user
