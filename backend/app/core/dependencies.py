from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User

# 🔐 OAuth2PasswordBearer: Ye FastAPI ko batata hai ki token kahan se milega. (Swagger UI me 'Authorize' button banayega)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# 1️⃣ Dhasu Function: Jo har private API me check karega ki request kiski taraf se aayi hai (Token verify karke)
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        # Token decode kar rahe hain using SECRET_KEY. Isme user_id aur role encode kiya tha.
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("user_id")

        # Agar token format me garbad hai (ex: payload nahi hai) toh error throw.
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token - Bhai ye token theek nahi hai.")

    except JWTError:
        # Token tampered ya expire hoh gaya hoga.
        raise HTTPException(status_code=401, detail="Token verification failed - Bhai fir se login karo, token expire ho gaya ya galat hai.")

    # Token parse ho gaya, ab database se cross check karte hain (User hamesha maujud hona chahiye)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found - Token toh sahi hai par user ab exist nahi karta.")

    return user # Ye return ho jayega hamari APIs me!

# 2️⃣ Helper: Sirf TEACHER allowed ho aise pages/endpoints ke liye
def teacher_only(current_user: User = Depends(get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teacher access only - Padhai pe dhyan do, tum teacher nahi ho!"
        )
    return current_user

# 3️⃣ Helper: Sirf STUDENT allowed ho aise pages/endpoints ke liye
def student_only(current_user: User = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access only - Sirf students yahaan allowed hain!"
        )
    return current_user
