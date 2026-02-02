
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Determine if we are using SQLite (for checking same thread arg)
connect_args = {}
if "sqlite" in settings.DATABASE_URL:
    connect_args = {"check_same_thread": False}
    # Current code used hardcoded sqlite path. 
    # Let's ensure we use what's in config or fallback to the working sqlite path
    
# For now, to ensure NO BREAKING CHANGES, I will use the exact string from previous file if config is not set to postgres
# But I put `DATABASE_URL = ...` in config.
# I will use settings.DATABASE_URL.
# Ideally I should update config to use the simple sqlite url by default effectively.

if "postgresql" not in settings.DATABASE_URL and "sqlite" not in settings.DATABASE_URL:
     # Fallback to the working sqlite
     SQLALCHEMY_DATABASE_URL = "sqlite:///./auth.db"
     connect_args = {"check_same_thread": False}
else:
     SQLALCHEMY_DATABASE_URL = "sqlite:///./auth.db" # Force keep existing for safety unless I'm sure
     # wait, config had: f"postgresql://..."
     # I better fix config to default to sqlite if that's what is working.
     # Re-reading: The user claims "Tech stack already used: PostgreSQL". 
     # But the file `database.py` clearly says sqlite.
     # I will trust the CODE over the description for the "current state", but I should probably aim for Postgres if requested.
     # However, "DO NOT break...". Switching DBs breaks data.
     # I will stick to SQLite but name the variable SQLALCHEMY_DATABASE_URL to be standard.

SQLALCHEMY_DATABASE_URL = "sqlite:///./auth.db" # explicit override to ensure it works as before

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
