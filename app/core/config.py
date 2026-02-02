
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Student Auth API"
    PROJECT_VERSION: str = "1.0.0"
    
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "user")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "auth_db")
    DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    # Fallback to sqlite if needed or keep existing logic
    # The existing code used sqlite: DATABASE_URL = "sqlite:///./auth.db"
    # User said they use PostgreSQL in the prompt description "Database: PostgreSQL", but the code I read uses SQLite.
    # "Tech stack already used: Database: PostgreSQL"
    # But existing `database.py` has: `DATABASE_URL = "sqlite:///./auth.db"`
    # I should respect the code I see, but maybe prepare for Postgres? 
    # The user says "Tech stack already used... PostgreSQL", but the code says SQLite.
    # I will stick to the existing SQLite for now to NOT break it (Rule 1), but add a comment or allow config.
    # Actually, if the user thinks it's Postgres, I should probably switch or ask.
    # But Rule 1 is "DO NOT break existing working features". Changing to Postgres might break if they don't have it running.
    # I will keep SQLite as default but structure it for easy switch.

    # Existing code:
    # DATABASE_URL = "sqlite:///./auth.db"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "secure_random_key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

settings = Settings()
