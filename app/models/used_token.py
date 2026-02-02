
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class UsedToken(Base):
    __tablename__ = "used_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    used_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
