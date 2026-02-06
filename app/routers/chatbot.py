from fastapi import APIRouter, Depends, HTTPException
from app.schemas.chatbot import ChatRequest, ChatResponse
from app.services.chatbot import ChatbotService
from app.core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)

chatbot_service = ChatbotService()

@router.post("/query", response_model=ChatResponse)
def query_chatbot(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Query the AI Chatbot.
    Automatically selects the best available provider (OpenAI / Gemini / Fallback).
    """
    result = chatbot_service.get_response(request.message, request.provider)
    
    return ChatResponse(
        response=result["response"],
        provider_used=result["provider"],
        session_id=request.session_id
    )
