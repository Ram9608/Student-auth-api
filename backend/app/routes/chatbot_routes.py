from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Resume, Job, User
from ..core.dependencies import get_current_user
from ..ai.groq_client import ask_groq

# 🚀 AI Chatbot Router Setup
# Purpose: Provides AI-driven assistance to both Students and Teachers.

router = APIRouter()

@router.post("/ask")
def chatbot_ask(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question = data.get("message") or data.get("question")
    if not question:
        raise HTTPException(status_code=400, detail="Message/question field is required.")

    # Fetch student resume context
    resume = db.query(Resume).filter(Resume.student_id == current_user.id).first()
    jobs = db.query(Job).all()
    resume_text = resume.extracted_text if resume else "No resume uploaded"
    job_titles = ", ".join([job.title for job in jobs]) if jobs else "No jobs available yet"

    if current_user.role == "teacher":
        system_prompt = (
            "You are 'CareerAI', a premium recruitment strategist. "
            "IMPORTANT: Output ONLY plain text. DO NOT use any markdown symbols like *, #, -, =, or _. "
            "Use empty lines to separate sections for readability. Be extremely concise and professional."
        )
        user_prompt = f"""
Target: {current_user.full_name}
Jobs: {job_titles}
Question: {question}

Response structure (Plain text only):
Core Insight: [1 short sentence]
Steps: [Max 3 short lines]
Next Action: [1 clear line]
"""
    else:
        system_prompt = (
            "You are 'CareerAI', an elite career mentor. "
            "IMPORTANT: Output ONLY plain text. DO NOT use any symbols like *, #, -, =, or _. "
            "Format with clear line breaks. No markup. No symbols. Professional and short."
        )
        user_prompt = f"""
Student: {current_user.full_name}
Context: {resume_text[:600]}
Jobs: {job_titles}
Request: {question}

Logic (Plain text only, very brief):
SKILL GAP: [1 line]
COURSE: [1 line Name]
ROADMAP: [3 short lines]
PRO TIP: [1 short line]
"""

    answer = ask_groq(system_prompt, user_prompt)
    return {"status": "success", "reply": answer, "answer": answer}

@router.post("/rejection-message")
def ai_rejection_message(
    job_title: str,
    missing_skills: List[str],
    current_user: User = Depends(get_current_user)
):
    """
    🎯 POST: /chatbot/rejection-message
    
    Purpose: Generate an AI-driven rejection message for HR/Teachers to send to candidates.
    Returns plain text feedback focused on growth and professional encouragement.
    """
    
    # 🎭 System instructions
    system_prompt = (
        "You are an empathetic HR professional. "
        "Write a professional, polite, and encouraging rejection email/message. "
        "Do NOT use harsh words. ALWAYS suggest areas of improvement."
    )

    # ✉️ User prompt
    user_prompt = f"""
HR Name: {current_user.full_name}
Job Role: {job_title}
Candidate missed these skills: {", ".join(missing_skills)}

Generate a professional rejection message that is kind and motivates the candidate to learn those missing skills.
"""

    # Generate the professional feedback message via the AI model.
    message = ask_groq(system_prompt, user_prompt)

    return {
        "rejection_message": message
    }

# Note: Logic is isolated in this file to maintain codebase readability and prevent 'main.py' complexity.
