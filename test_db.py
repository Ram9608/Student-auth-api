import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

try:
    from backend.app.database import engine
    from sqlalchemy import text, inspect

    # Try to connect
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("DATABASE CONNECTION: OK")
        
        # Check for tables
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"EXISTING TABLES: {tables}")
        
        required_tables = ["users", "jobs", "applications"]
        missing = [t for t in required_tables if t not in tables]
        
        if not missing:
            print("TABLE AUTO-CREATION: OK")
        else:
            print(f"TABLE AUTO-CREATION: FAILED (Missing: {missing})")
            print("Attempting to create tables...")
            from backend.app.models import Base
            Base.metadata.create_all(bind=engine)
            tables_after = inspector.get_table_names()
            print(f"TABLES AFTER CREATION ATTEMPT: {tables_after}")

except Exception as e:
    print(f"SYSTEM CHECK FAILED: {str(e)}")
