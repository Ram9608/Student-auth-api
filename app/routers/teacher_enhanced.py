from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.routers.deps import get_current_teacher
from app.models import User, Job, JobApplication
from app.models.enhanced_models import ApplicationStatus, EmailNotification
from app.services.analytics_service import TeacherAnalyticsService
from app.schemas.enhanced_schemas import (
    TeacherAnalyticsResponse, ApplicantRankingResponse,
    ApplicationReviewRequest
)

router = APIRouter(prefix="/teacher", tags=["Teacher Enhanced"])


@router.get("/analytics", response_model=TeacherAnalyticsResponse)
def get_teacher_analytics(
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive teacher analytics dashboard
    
    Returns:
    - Total jobs posted
    - Total applications received
    - Average applicant resume score
    - Skill demand heatmap
    - Jobs with no applications
    """
    metrics = TeacherAnalyticsService.calculate_teacher_metrics(db, current_user.id)
    return metrics


@router.get("/jobs/{job_id}/applicants/ranked")
def get_ranked_applicants(
    job_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Get ranked list of applicants for a job with explanations
    
    Ranking based on:
    - Resume score (70%)
    - Learning intent/courses completed (20%)
    - Previous teacher ratings (10%)
    """
    # Verify job belongs to teacher
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.teacher_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or unauthorized")
    
    ranked_applicants = TeacherAnalyticsService.rank_applicants(db, job_id)
    
    return {
        'job_id': job_id,
        'job_title': job.title,
        'total_applicants': len(ranked_applicants),
        'applicants': ranked_applicants
    }


@router.patch("/applications/{application_id}/status")
def update_application_status(
    application_id: int,
    status: ApplicationStatus,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Update application status and send notification"""
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Verify teacher owns the job
    if application.job.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    old_status = application.status
    application.status = status
    application.updated_at = datetime.utcnow()
    
    if status == ApplicationStatus.VIEWED and not application.viewed_at:
        application.viewed_at = datetime.utcnow()
    
    db.commit()
    
    # Queue email notification
    _queue_status_notification(db, application, old_status, status)
    
    return {
        "message": f"Application status updated to {status.value}",
        "application_id": application_id,
        "new_status": status.value
    }


@router.post("/applications/{application_id}/review")
def add_application_review(
    application_id: int,
    review: ApplicationReviewRequest,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """
    Add teacher review to application
    
    Includes:
    - Rating (1-5 stars)
    - Private notes
    - Rejection reason (if applicable)
    """
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Verify authorization
    if application.job.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Update review fields
    if review.rating:
        application.teacher_rating = review.rating
    
    if review.notes:
        application.teacher_notes = review.notes
    
    if review.rejection_reason:
        application.rejection_reason = review.rejection_reason
        application.status = ApplicationStatus.REJECTED
    
    application.updated_at = datetime.utcnow()
    db.commit()
    
    return {
        "message": "Review added successfully",
        "application_id": application_id
    }


@router.post("/jobs/intelligence/suggest-skills")
def suggest_skills_for_job(
    job_title: str,
    current_skills: List[str],
    db: Session = Depends(get_db)
):
    """
    Suggest additional skills based on similar jobs
    
    Returns:
    - Suggested skills
    - Expected applicant pool size
    - Warning if requirements too strict
    """
    from collections import Counter
    
    # Find similar jobs (same title or category)
    similar_jobs = db.query(Job).filter(
        Job.title.ilike(f"%{job_title}%")
    ).limit(20).all()
    
    if not similar_jobs:
        return {
            "suggested_skills": [],
            "message": "No similar jobs found for comparison"
        }
    
    # Aggregate skills from similar jobs
    all_skills = []
    for job in similar_jobs:
        if job.required_skills:
            all_skills.extend([s.lower() for s in job.required_skills])
    
    skill_frequency = Counter(all_skills)
    
    # Filter out skills already in current_skills
    current_skills_lower = [s.lower() for s in current_skills]
    suggested = [
        skill for skill, count in skill_frequency.most_common(10)
        if skill not in current_skills_lower
    ]
    
    # Calculate expected applicant pool
    total_students = db.query(User).filter(User.role == 'student').count()
    
    # Estimate based on skill count (simplified)
    skill_count = len(current_skills)
    if skill_count <= 3:
        expected_pool = int(total_students * 0.4)
        warning = None
    elif skill_count <= 5:
        expected_pool = int(total_students * 0.25)
        warning = None
    elif skill_count <= 7:
        expected_pool = int(total_students * 0.15)
        warning = "Moderate skill requirements. Consider if all are truly required."
    else:
        expected_pool = int(total_students * 0.08)
        warning = f"⚠️ {skill_count} required skills may reduce applications by 50%+. Consider marking some as 'Nice to Have'."
    
    return {
        "suggested_skills": suggested[:5],
        "expected_applicant_pool_size": expected_pool,
        "warning": warning,
        "skill_count": skill_count
    }


@router.get("/applications/export/{job_id}")
def export_applications_csv(
    job_id: int,
    current_user: User = Depends(get_current_teacher),
    db: Session = Depends(get_db)
):
    """Export applications as CSV data"""
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.teacher_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    applications = db.query(Application).filter(
        Application.job_id == job_id
    ).all()
    
    csv_data = []
    for app in applications:
        csv_data.append({
            'Applicant Name': f"{app.student.first_name} {app.student.last_name}",
            'Email': app.student.email,
            'Resume Score': app.overall_match_score,
            'Skill Match %': app.skill_match_score,
            'Applied Date': app.applied_at.strftime('%Y-%m-%d'),
            'Status': app.status if isinstance(app.status, str) else app.status.value,
            'Teacher Rating': 'N/A', # Field removed or changed
            'Notes': app.teacher_notes or ''
        })
    
    return {
        "job_title": job.title,
        "total_applicants": len(csv_data),
        "data": csv_data
    }


def _queue_status_notification(db: Session, application: JobApplication, old_status: str, new_status: str):
    """Queue email notification for status change"""
    student = application.student
    job = application.job
    
    notification_templates = {
        ApplicationStatus.VIEWED: {
            'subject': f"Application Update: {job.title}",
            'body': f"Good news! The employer has viewed your application for {job.title} at {job.company}."
        },
        ApplicationStatus.SHORTLISTED: {
            'subject': f"🎉 You've Been Shortlisted: {job.title}",
            'body': f"Congratulations! You've been shortlisted for {job.title} at {job.company}. The employer may contact you soon."
        },
        ApplicationStatus.REJECTED: {
            'subject': f"Application Update: {job.title}",
            'body': f"Thank you for your interest in {job.title} at {job.company}. We've decided to move forward with other candidates."
        }
    }
    
    if new_status in notification_templates:
        template = notification_templates[new_status]
        
        notification = EmailNotification(
            recipient_email=student.email,
            subject=template['subject'],
            body=template['body'],
            notification_type=f"application_{new_status.value}"
        )
        
        db.add(notification)
        db.commit()
