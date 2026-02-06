from typing import Dict, Optional
from sqlalchemy.orm import Session
from app.models import User
from app.models.enhanced_models import Application, CourseProgress, RecommendationLog
from app.services.chatbot import ChatbotService as BaseChatbotService


class EnhancedChatbotService(BaseChatbotService):
    """
    Enhanced chatbot with student context injection
    
    Injects:
    - Student resume data (skills, experience)
    - Applied jobs history
    - Missing skills analysis
    - Rejected job reasons
    - Course recommendations
    """
    
    def get_response_with_context(self, message: str, user_id: int, db: Session, preferred_provider: str = "auto") -> dict:
        """Generate AI response with full student context"""
        
        # Fetch student data
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return self.get_response(message, preferred_provider)
        
        # Build comprehensive context
        context = self._build_student_context(user, db)
        
        # Construct enhanced prompt
        enhanced_message = f"""
Student Profile Context:
{context}

Student Question: {message}

Instructions: Answer the student's question using their actual profile data. Be specific and actionable. If suggesting courses, reference the recommended courses list. If explaining job matches, use the actual skill gaps.
"""
        
        # Get AI response
        result = self.get_response(enhanced_message, preferred_provider)
        
        return result
    
    def _build_student_context(self, user: User, db: Session) -> str:
        """Build comprehensive student context string"""
        
        context_parts = []
        
        # Basic profile
        context_parts.append(f"Name: {user.full_name}")
        context_parts.append(f"Email: {user.email}")
        context_parts.append(f"Desired Role: {user.desired_role or 'Not specified'}")
        
        # Skills
        skills = user.skills or []
        context_parts.append(f"Current Skills ({len(skills)}): {', '.join(skills) if skills else 'None listed'}")
        
        # Experience
        experience_count = len(user.experience or [])
        context_parts.append(f"Experience Entries: {experience_count}")
        
        # Education
        education_count = len(user.education or [])
        context_parts.append(f"Education Entries: {education_count}")
        
        # Recent applications
        recent_applications = db.query(Application).filter(
            Application.student_id == user.id
        ).order_by(Application.applied_at.desc()).limit(5).all()
        
        if recent_applications:
            context_parts.append("\nRecent Job Applications:")
            for app in recent_applications:
                status_info = f"{app.job.title} at {app.job.company} - Status: {app.status.value}"
                if app.overall_match_score:
                    status_info += f" (Match: {app.overall_match_score}%)"
                context_parts.append(f"  - {status_info}")
        
        # Rejected applications with reasons
        rejected_apps = [app for app in recent_applications if app.status.value == 'rejected']
        if rejected_apps:
            context_parts.append("\nRejected Applications:")
            for app in rejected_apps:
                reason = app.rejection_reason or "No specific reason provided"
                context_parts.append(f"  - {app.job.title}: {reason}")
        
        # Missing skills (from recommendation logs)
        recent_logs = db.query(RecommendationLog).filter(
            RecommendationLog.student_id == user.id
        ).order_by(RecommendationLog.created_at.desc()).limit(3).all()
        
        if recent_logs:
            all_missing_skills = set()
            for log in recent_logs:
                if log.missing_skills:
                    all_missing_skills.update(log.missing_skills)
            
            if all_missing_skills:
                context_parts.append(f"\nCommon Missing Skills: {', '.join(list(all_missing_skills)[:5])}")
        
        # Course progress
        completed_courses = db.query(CourseProgress).filter(
            CourseProgress.student_id == user.id,
            CourseProgress.status == 'completed'
        ).all()
        
        in_progress_courses = db.query(CourseProgress).filter(
            CourseProgress.student_id == user.id,
            CourseProgress.status == 'in_progress'
        ).all()
        
        if completed_courses:
            context_parts.append(f"\nCompleted Courses ({len(completed_courses)}):")
            for course in completed_courses[:3]:
                context_parts.append(f"  - {course.course_name} ({course.skill})")
        
        if in_progress_courses:
            context_parts.append(f"\nCourses In Progress ({len(in_progress_courses)}):")
            for course in in_progress_courses[:3]:
                context_parts.append(f"  - {course.course_name} ({course.skill})")
        
        # Recommended courses (from existing service)
        if all_missing_skills:
            from app.services.resume_analyzer import ResumeAnalyzerService
            analyzer = ResumeAnalyzerService()
            recommended = analyzer._get_course_recommendations(list(all_missing_skills)[:3])
            
            if recommended:
                context_parts.append("\nRecommended Courses:")
                for course in recommended[:3]:
                    context_parts.append(f"  - {course.course_name} ({course.platform}) for {course.skill}")
        
        return "\n".join(context_parts)
    
    def explain_job_rejection(self, user_id: int, job_id: int, db: Session) -> str:
        """Generate explanation for why a job wasn't recommended"""
        
        user = db.query(User).filter(User.id == user_id).first()
        from app.models import Job
        job = db.query(Job).filter(Job.id == job_id).first()
        
        if not user or not job:
            return "Unable to find job or user data."
        
        # Check if there's a recommendation log
        log = db.query(RecommendationLog).filter(
            RecommendationLog.student_id == user_id,
            RecommendationLog.job_id == job_id
        ).first()
        
        if log:
            return log.explanation
        
        # Generate fresh explanation
        from app.services.analytics_service import JobMatchingService
        match_data = JobMatchingService.calculate_match_breakdown(user, job)
        
        explanation_parts = []
        
        if match_data['final_match_score'] < 50:
            explanation_parts.append(f"Your overall match score for this role is {match_data['final_match_score']}%, which is below the recommendation threshold.")
        
        if match_data['missing_skills']:
            explanation_parts.append(f"You're missing {len(match_data['missing_skills'])} critical skills: {', '.join(match_data['missing_skills'][:5])}")
        
        if match_data['skill_match_percentage'] < 60:
            explanation_parts.append(f"Your skill match is {match_data['skill_match_percentage']}%. Most recommended roles require at least 60% skill alignment.")
        
        # Suggest courses
        from app.services.resume_analyzer import ResumeAnalyzerService
        analyzer = ResumeAnalyzerService()
        courses = analyzer._get_course_recommendations(match_data['missing_skills'][:2])
        
        if courses:
            explanation_parts.append(f"\nTo improve your chances, consider completing: {courses[0].course_name} ({courses[0].platform})")
        
        return " ".join(explanation_parts)
