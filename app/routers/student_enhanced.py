from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user, get_current_teacher
from app.models import User
from app.models.enhanced_models import (
    Application, ResumeVersion, CourseProgress,
    RecommendationLog, ApplicationStatus, CourseStatus
)
from app.services.analytics_service import (
    StudentAnalyticsService, JobMatchingService,
    ResumeComparisonService
)
from app.schemas.enhanced_schemas import (
    StudentDashboardResponse, JobMatchBreakdownResponse,
    ResumeComparisonResponse, CourseProgressUpdate,
    ApplicationStatusUpdate
)

router = APIRouter(prefix="/student", tags=["Student Enhanced"])


@router.get("/dashboard/metrics", response_model=StudentDashboardResponse)
def get_student_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive student dashboard metrics
    
    Returns:
    - Profile completeness %
    - Resume score breakdown
    - Matched jobs count
    - Top 5 missing skills
    - Recommended courses
    """
    # Profile completeness
    completeness = StudentAnalyticsService.calculate_profile_completeness(current_user)
    
    # Resume score
    resume_score = StudentAnalyticsService.calculate_resume_score(db, current_user.id)
    
    # Matched jobs count
    matched_jobs_count = StudentAnalyticsService.get_matched_jobs_count(db, current_user.id)
    
    # Missing skills
    missing_skills = StudentAnalyticsService.get_missing_skills(db, current_user.id, limit=5)
    
    # Get recommended courses (from existing course recommendation service)
    from app.services.resume_analyzer import ResumeAnalyzerService
    analyzer = ResumeAnalyzerService()
    missing_skill_names = [skill['skill'] for skill in missing_skills]
    recommended_courses = analyzer._get_course_recommendations(missing_skill_names[:3])
    
    return {
        'profile_completeness': completeness['completion_percentage'],
        'profile_details': completeness['details'],
        'next_steps': completeness['next_steps'],
        'resume_score': resume_score['total_score'],
        'resume_breakdown': resume_score['breakdown'],
        'matched_jobs_count': matched_jobs_count,
        'missing_skills': missing_skills,
        'recommended_courses': [
            {
                'skill': course.skill,
                'course_name': course.course_name,
                'platform': course.platform,
                'url': course.course_url,
                'level': course.level,
                'language': course.language
            }
            for course in recommended_courses
        ]
    }


@router.get("/jobs/{job_id}/match-breakdown", response_model=JobMatchBreakdownResponse)
def get_job_match_breakdown(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed match breakdown for a specific job
    
    Returns:
    - Skill match %
    - Experience match %
    - Role match %
    - Final match score
    - Detailed explanation
    """
    from app.models import Job
    job = db.query(Job).filter(Job.id == job_id).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    match_data = JobMatchingService.calculate_match_breakdown(current_user, job)
    
    # Log this recommendation for explainability
    log_entry = RecommendationLog(
        student_id=current_user.id,
        job_id=job_id,
        recommendation_score=match_data['final_match_score'],
        skill_match_score=match_data['skill_match_percentage'],
        experience_match_score=match_data['experience_match_percentage'],
        role_match_score=match_data['role_match_percentage'],
        matched_skills=match_data['matched_skills'],
        missing_skills=match_data['missing_skills'],
        explanation=match_data['explanation'],
        shown_to_student=True
    )
    db.add(log_entry)
    db.commit()
    
    return match_data


@router.get("/resume/versions")
def get_resume_versions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all resume versions for the student"""
    versions = db.query(ResumeVersion).filter(
        ResumeVersion.student_id == current_user.id
    ).order_by(ResumeVersion.version_number.desc()).all()
    
    return [
        {
            'version_number': v.version_number,
            'uploaded_at': v.uploaded_at,
            'resume_score': v.resume_score,
            'skills_count': len(v.extracted_skills) if v.extracted_skills else 0,
            'file_path': v.file_path
        }
        for v in versions
    ]


@router.get("/resume/compare/{old_version}/{new_version}", response_model=ResumeComparisonResponse)
def compare_resume_versions(
    old_version: int,
    new_version: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compare two resume versions"""
    comparison = ResumeComparisonService.compare_versions(
        db, current_user.id, old_version, new_version
    )
    
    if 'error' in comparison:
        raise HTTPException(status_code=404, detail=comparison['error'])
    
    return comparison


@router.get("/courses/progress")
def get_learning_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get student's learning progress"""
    courses = db.query(CourseProgress).filter(
        CourseProgress.student_id == current_user.id
    ).all()
    
    in_progress = [c for c in courses if c.status == CourseStatus.IN_PROGRESS]
    completed = [c for c in courses if c.status == CourseStatus.COMPLETED]
    
    return {
        'total_courses': len(courses),
        'in_progress_count': len(in_progress),
        'completed_count': len(completed),
        'completion_rate': round((len(completed) / len(courses)) * 100, 1) if courses else 0,
        'courses': [
            {
                'id': c.id,
                'course_name': c.course_name,
                'platform': c.platform,
                'skill': c.skill,
                'status': c.status.value,
                'started_at': c.started_at,
                'completed_at': c.completed_at,
                'progress_percentage': c.progress_percentage
            }
            for c in courses
        ]
    }


@router.post("/courses/{course_id}/start")
def start_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a course as started"""
    course = db.query(CourseProgress).filter(
        CourseProgress.id == course_id,
        CourseProgress.student_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course.status = CourseStatus.IN_PROGRESS
    course.started_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Course started successfully"}


@router.post("/courses/{course_id}/complete")
def complete_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a course as completed and update student skills"""
    course = db.query(CourseProgress).filter(
        CourseProgress.id == course_id,
        CourseProgress.student_id == current_user.id
    ).first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course.status = CourseStatus.COMPLETED
    course.completed_at = datetime.utcnow()
    course.progress_percentage = 100.0
    
    # Auto-add skill to profile if not present
    if course.skill and course.skill not in (current_user.skills or []):
        if not current_user.skills:
            current_user.skills = []
        current_user.skills.append(course.skill)
    
    db.commit()
    
    # Recalculate resume score
    new_score = StudentAnalyticsService.calculate_resume_score(db, current_user.id)
    
    return {
        "message": "Course completed! Skill added to your profile.",
        "skill_added": course.skill,
        "new_resume_score": new_score['total_score']
    }


@router.get("/applications")
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all applications with status tracking"""
    applications = db.query(Application).filter(
        Application.student_id == current_user.id
    ).order_by(Application.applied_at.desc()).all()
    
    return [
        {
            'id': app.id,
            'job_id': app.job_id,
            'job_title': app.job.title,
            'company': app.job.company,
            'status': app.status.value,
            'applied_at': app.applied_at,
            'viewed_at': app.viewed_at,
            'updated_at': app.updated_at,
            'skill_match_score': app.skill_match_score,
            'overall_match_score': app.overall_match_score
        }
        for app in applications
    ]


@router.post("/jobs/{job_id}/apply")
def apply_to_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply to a job and calculate match scores"""
    from app.models import Job
    
    # Check if job exists
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if already applied
    existing = db.query(Application).filter(
        Application.student_id == current_user.id,
        Application.job_id == job_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    # Calculate match scores
    match_data = JobMatchingService.calculate_match_breakdown(current_user, job)
    
    # Create application
    application = Application(
        student_id=current_user.id,
        job_id=job_id,
        status=ApplicationStatus.APPLIED,
        skill_match_score=match_data['skill_match_percentage'],
        experience_match_score=match_data['experience_match_percentage'],
        overall_match_score=match_data['final_match_score']
    )
    
    db.add(application)
    db.commit()
    
    # Send email notification (queue it)
    from app.services.email import send_application_confirmation
    send_application_confirmation(current_user.email, job.title, job.company)
    
    return {
        "message": "Application submitted successfully",
        "application_id": application.id,
        "match_score": match_data['final_match_score']
    }
