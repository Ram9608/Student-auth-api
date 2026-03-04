import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
try:
    engine = create_engine(os.getenv('DATABASE_URL'))
    with engine.connect() as conn:
        # Delete all jobs to clear mock/sample data
        conn.execute(text('DELETE FROM applications')) # Clear applications first due to FK
        conn.execute(text('DELETE FROM jobs'))
        conn.commit()
        print("SUCCESS: All jobs and applications cleared from internal database.")
except Exception as e:
    print(f"FAILED: {e}")
