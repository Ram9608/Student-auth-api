import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    res = conn.execute(text('SELECT id, title, is_active FROM jobs'))
    jobs = [dict(zip(res.keys(), row)) for row in res]
    print(f"DEBUG_JOBS: {jobs}")
