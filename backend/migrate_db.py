import sys
sys.path.insert(0, '.')
from app.database import engine
from sqlalchemy import text

print("Starting DB migration...")

cols = [
    ("experience_required", "VARCHAR(50)"),
    ("job_type", "VARCHAR(50)"),
    ("location_type", "VARCHAR(50)"),
    ("salary", "VARCHAR(100)"),
    ("last_date", "VARCHAR(30)"),
    ("is_active", "BOOLEAN"),
]

for name, typ in cols:
    try:
        stmt = f"ALTER TABLE jobs ADD COLUMN IF NOT EXISTS {name} {typ}"
        with engine.begin() as c:
            c.execute(text(stmt))
        print(f"  Added column: {name}")
    except Exception as e:
        print(f"  Skipped {name}: {str(e)[:60]}")

# Set defaults for existing rows
try:
    with engine.begin() as c:
        c.execute(text("UPDATE jobs SET experience_required = 'fresher' WHERE experience_required IS NULL"))
        c.execute(text("UPDATE jobs SET job_type = 'full-time' WHERE job_type IS NULL"))
        c.execute(text("UPDATE jobs SET location_type = 'remote' WHERE location_type IS NULL"))
        c.execute(text("UPDATE jobs SET is_active = TRUE WHERE is_active IS NULL"))
    print("  Defaults set for existing rows.")
except Exception as e:
    print(f"  Defaults error: {e}")

# Create teacher_profiles table
try:
    with engine.begin() as c:
        c.execute(text("""
            CREATE TABLE IF NOT EXISTS teacher_profiles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER UNIQUE REFERENCES users(id),
                mobile VARCHAR(20),
                designation VARCHAR(100),
                department VARCHAR(200),
                city VARCHAR(100),
                state VARCHAR(100),
                bio TEXT,
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """))
    print("  teacher_profiles table ready.")
except Exception as e:
    print(f"  teacher_profiles: {str(e)[:60]}")

print("MIGRATION COMPLETE!")
