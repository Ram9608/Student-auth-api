import os
import requests
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

def check_env():
    print("--- Environment Check ---")
    keys = ["DATABASE_URL", "GROQ_API_KEY", "SECRET_KEY", "SMTP_USER", "SMTP_PASS"]
    for k in keys:
        val = os.getenv(k)
        print(f"{k}: {'PRESENT' if val else 'MISSING'}")

def check_db():
    print("\n--- Database Check ---")
    url = os.getenv("DATABASE_URL")
    if not url:
        print("DATABASE_URL missing!")
        return
    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            # Check for tables
            rs = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
            tables = [r[0] for r in rs if r[0] != 'spatial_ref_sys']
            print(f"Tables found: {', '.join(tables)}")
            
            # Check user table
            rs = conn.execute(text("SELECT COUNT(*) FROM users"))
            count = rs.scalar()
            print(f"Total Users in DB: {count}")
    except Exception as e:
        print(f"DB Error: {e}")

if __name__ == "__main__":
    check_env()
    check_db()
