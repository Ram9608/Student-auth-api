from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
from datetime import timedelta
import jwt
from jwt.exceptions import InvalidTokenError
import os

# Import local modules
from database import engine, get_db, Base
from models import User
from schemas import UserCreate, UserResponse, Token, PasswordResetRequest, PasswordReset
from security import (
    get_password_hash,
    verify_password,
    create_access_token,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Auth API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Frontend Build (SPA)
# Mount assets first so they don't get caught by the catch-all
app.mount("/assets", StaticFiles(directory="react_frontend/dist/assets"), name="assets")

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# ------------------------------------------------------------------------------
# Dependencies
# ------------------------------------------------------------------------------

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing 'sub' claim",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = int(user_id_str)
    except InvalidTokenError as e:
        print(f"Token validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except ValueError as e:
        print("Token 'sub' claim is not an integer")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Value error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=f"User not found for id: {user_id}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user

# ------------------------------------------------------------------------------
# API Auth Routes
# ------------------------------------------------------------------------------

@app.get("/api/v1/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    try:
        # Pinging database
        db.execute("SELECT 1")
        return {"status": "online", "database": "connected"}
    except Exception as e:
        return {"status": "offline", "database": str(e)}

@app.post("/api/v1/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_pwd = get_password_hash(user.password)
    
    # Create user
    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        hashed_password=hashed_pwd,
        role="student" # Default role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/v1/auth/login", response_model=Token, tags=["Auth"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Fetch user
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/v1/auth/forgot-password", tags=["Auth"])
def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        reset_token = create_access_token(
            data={"sub": str(user.id), "type": "reset"},
            expires_delta=timedelta(minutes=15)
        )
        reset_link = f"http://localhost:8000/reset-password?token={reset_token}"
        print(f"RESET LINK: {reset_link}") 

    return {"message": "If this email is registered, you will receive a password reset link."}

@app.post("/api/v1/auth/reset-password", tags=["Auth"])
def reset_password(reset_data: PasswordReset, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(reset_data.token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token")
    except InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = get_password_hash(reset_data.new_password)
    db.commit()
    
    return {"message": "Password reset successfully"}

# ------------------------------------------------------------------------------
# API Protected Routes
# ------------------------------------------------------------------------------

@app.get("/api/v1/student/profile", response_model=UserResponse, tags=["Student"])
def get_student_profile(current_user: User = Depends(get_current_user)):
    return current_user


# ------------------------------------------------------------------------------
# SPA Catch-All Route (Must be last)
# ------------------------------------------------------------------------------

@app.get("/{full_path:path}", response_class=HTMLResponse, tags=["Frontend"])
async def catch_all(full_path: str, request: Request):
    # Determine the file path
    dist_dir = "react_frontend/dist"
    
    # Check if the file exists in dist (e.g. valid static file that wasn't /assets)
    # This might handle images in public/ or similar if built differently.
    # But Vite usually puts assets in /assets. 
    # For robust SPA, we just return index.html for non-api routes.
    
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="API endpoint not found")

    return FileResponse(os.path.join(dist_dir, "index.html"))
