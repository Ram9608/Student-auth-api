import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.database import engine
from app.models import Base

print("Dropping tables...")
Base.metadata.drop_all(bind=engine)
print("Creating tables with new schema...")
Base.metadata.create_all(bind=engine)
print("Done!")
