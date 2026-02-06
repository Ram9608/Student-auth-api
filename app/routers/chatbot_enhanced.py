from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routers.deps import get_current_user
from app.models import User
from app.schemas.chatbot import ChatRequest, ChatResponse
from app.services.enhanced_chatbot import EnhancedChatbotService

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot Enhanced"]
)

chatbot_service = EnhancedChatbotService()


@router.post("/query-enhanced", response_model=ChatResponse)
def query_chatbot_with_context(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Query AI Chatbot with full student context injection
    
    Context includes:
    - Student profile (skills, experience, education)
    - Application history
    - Missing skills
    - Course progress
    - Rejection reasons
    
    Example questions:
    - "Why wasn't I recommended for backend roles?"
    - "What skills should I learn next?"
    - "Why was my application rejected?"
    """
    result = chatbot_service.get_response_with_context(
        message=request.message,
        user_id=current_user.id,
        db=db,
        preferred_provider=request.provider
    )
    
    return ChatResponse(
        response=result["response"],
        provider_used=result["provider"],
        session_id=request.session_id
    )


@router.get("/explain-rejection/{job_id}")
def explain_job_rejection(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI explanation for why a job wasn't recommended"""
    explanation = chatbot_service.explain_job_rejection(
        user_id=current_user.id,
        job_id=job_id,
        db=db
    )
    
    return {
        "job_id": job_id,
        "explanation": explanation
    }
