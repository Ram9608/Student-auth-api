from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt
from app.config import settings

# pwd_context ek object banaya. "bcrypt" algorithm use kar raha hai taki plain password secure text me convert ho (hashing code).
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 1️⃣ Yeh function naye plain text password (jaise '1234') ko hash string me convert karta hai. Direct password DB me nahi bacha jayega!
def hash_password(password: str):
    return pwd_context.hash(password)

# 2️⃣ Yeh function check karta hai user ne jo password login pr dala kya wo pichle saved hashed password code se verify hota hai ya nahi.
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 3️⃣ Yeh function login success ke bad JWT access token banata hai.
def create_access_token(data: dict, expires_minutes: int = 1440):
    to_encode = data.copy() # Original payload data ki ek copy function ke andar banate hain.
    
    # Token ki expiry time calculate karte hain. Abhi ke time me expires_minutes add karte hain.
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    
    # Payload dict ke andar token ki expiry 'exp' key ke sath set karte hain.
    to_encode.update({"exp": expire})
    
    # Token ko encode (banata) hai secret key aur ALGORITHM ke sath.
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
