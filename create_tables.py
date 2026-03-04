import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from backend.app.database import engine
from backend.app.models import Base
from sqlalchemy import inspect

print("Attempting to create tables...")
Base.metadata.create_all(bind=engine)

inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Created tables: {tables}")
