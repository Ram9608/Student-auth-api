from pydantic import BaseModel
from typing import Optional, Literal

class ChatRequest(BaseModel):
    message: str
    provider: Optional[Literal["openai", "gemini", "auto"]] = "auto"
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    provider_used: str
    status: str = "success"
    session_id: Optional[str] = None
