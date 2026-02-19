from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from collections import Counter
import statistics

from app.models.enhanced_models import (
    ResumeVersion, CourseProgress, 
    RecommendationLog, TeacherAnalytics
)
from app.models import User, Job, JobApplication


class StudentAnalyticsService:
    """Service for calculating student dashboard metrics"""
    
    @staticmethod
    def calculate_profile_completeness(student: User) -> Dict:
        """
        Calculate profile completion percentage
        
        Formula:
        - Email (verified): 10%
        - Skills (min 3): 20%
        - Resume uploaded: 20%
        - Education (min 1): 15%
        - Experience (min 1): 15%
        - Social links (min 1): 10%
        - Profile picture: 10%
        """
        score = 0
        details = {}
        profile = student.student_profile
        
        # Email (always present due to registration)
        score += 10
        details['email'] = True
        
        if not profile:
             return {
                'completion_percentage': score,
                'details': details,
                'next_steps': ["Complete your student profile"]
            }

        # Skills
        skills_count = len(profile.skills) if profile.skills else 0
        if skills_count >= 3:
            score += 20
            details['skills'] = True
        else:
            details['skills'] = False
            details['skills_needed'] = 3 - skills_count
        
        # Resume
        if profile.resume_path:
            score += 20
            details['resume'] = True
        else:
            details['resume'] = False
        
        # Education
        education_count = len(profile.education_details) if profile.education_details else 0
        if education_count >= 1:
            score += 15
            details['education'] = True
        else:
            details['education'] = False
        
        # Experience
        experience_count = len(profile.experience_details) if profile.experience_details else 0
        if experience_count >= 1:
            score += 15
            details['experience'] = True
        else:
            details['experience'] = False
        
        # Social links
        social_count = sum([
            bool(profile.github_link),
            bool(profile.linkedin_link)
        ])
        if social_count >= 1:
            score += 10
            details['social_links'] = True
        else:
            details['social_links'] = False
        
        # Profile picture (if field exists - currently not in model, skipping)
        # if hasattr(student, 'profile_picture') and student.profile_picture:
        #     score += 10
        #     details['profile_picture'] = True
        # else:
        #     details['profile_picture'] = False
        
        return {
            'completion_percentage': score,
            'details': details,
            'next_steps': StudentAnalyticsService._get_next_steps(details)
        }
    
    @staticmethod
    def _get_next_steps(details: Dict) -> List[str]:
        """Generate actionable next steps"""
        steps = []
        if not details.get('resume'):
            steps.append("Upload your resume to increase visibility")
        if not details.get('skills'):
            steps.append(f"Add {details.get('skills_needed', 3)} more skills to your profile")
        if not details.get('education'):
            steps.append("Add your educational background")
        if not details.get('experience'):
            steps.append("Add your work or project experience")
        if not details.get('social_links'):
            steps.append("Add LinkedIn or GitHub profile")
        return steps[:3]  # Top 3 priorities
    
    @staticmethod
    def calculate_resume_score(db: Session, student_id: int) -> Dict:
        """
        Calculate comprehensive resume score
        
        Breakdown:
        - Skills coverage (40%): Number and relevance of skills
        - Experience (30%): Years and quality
        - Education (20%): Degree and institution
        - Certifications/Projects (10%): Additional credentials
        """
        student = db.query(User).filter(User.id == student_id).first()
        
        # Get latest resume version if exists
        latest_resume = db.query(ResumeVersion).filter(
            ResumeVersion.student_id == student_id
        ).order_by(desc(ResumeVersion.version_number)).first()
        
        if latest_resume and latest_resume.resume_score:
            return {
                'total_score': latest_resume.resume_score,
                'skill_score': latest_resume.skill_score,
                'experience_score': latest_resume.experience_score,
                'education_score': latest_resume.education_score,
                'breakdown': {
                    'skills': f"{latest_resume.skill_score}/40",
                    'experience': f"{latest_resume.experience_score}/30",
                    'education': f"{latest_resume.education_score}/20",
                    'extras': f"{10}/10"  # Placeholder
                }
            }
        
        # Fallback calculation from profile
        profile = student.student_profile
        
        if not profile:
            skill_score = 0
            experience_score = 0
            education_score = 0
            extras_score = 0
        else:
            skill_score = min((len(profile.skills or []) / 10) * 40, 40)
            experience_score = min((len(profile.experience_details or []) / 3) * 30, 30)
            education_score = min((len(profile.education_details or []) / 2) * 20, 20)
            extras_score = 10 if profile.resume_path else 0
        
        total = skill_score + experience_score + education_score + extras_score
        
        return {
            'total_score': round(total, 1),
            'skill_score': round(skill_score, 1),
            'experience_score': round(experience_score, 1),
            'education_score': round(education_score, 1),
            'breakdown': {
                'skills': f"{round(skill_score, 1)}/40",
                'experience': f"{round(experience_score, 1)}/30",
                'education': f"{round(education_score, 1)}/20",
                'extras': f"{extras_score}/10"
            }
        }
    
    @staticmethod
    def get_missing_skills(db: Session, student_id: int, limit: int = 5) -> List[Dict]:
        """
        Identify top missing skills based on job market demand
        """
        student = db.query(User).filter(User.id == student_id).first()
        profile = student.student_profile if student else None
        student_skills = set([s.lower() for s in (profile.skills or [])]) if profile else set()
        
        # Get all skills from active jobs
        all_jobs = db.query(Job).filter(Job.is_active == True).all()
        job_skills = []
        for job in all_jobs:
            if job.required_skills:
                job_skills.extend([s.lower() for s in job.required_skills])
        
        # Count frequency
        skill_frequency = Counter(job_skills)
        
        # Filter out skills student already has
        missing_skills = {
            skill: count for skill, count in skill_frequency.items()
            if skill not in student_skills
        }
        
        # Sort by frequency and return top N
        top_missing = sorted(missing_skills.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        return [
            {
                'skill': skill,
                'demand_count': count,
                'priority': 'High' if count >= 5 else 'Medium' if count >= 3 else 'Low'
            }
            for skill, count in top_missing
        ]
    
    @staticmethod
    def get_matched_jobs_count(db: Session, student_id: int) -> int:
        """Count jobs that match student profile (>50% skill match)"""
        student = db.query(User).filter(User.id == student_id).first()
        profile = student.student_profile if student else None
        student_skills = set([s.lower() for s in (profile.skills or [])]) if profile else set()
        
        if not student_skills:
            return 0
        
        matched_count = 0
        all_jobs = db.query(Job).filter(Job.is_active == True).all()
        
        for job in all_jobs:
            if not job.required_skills:
                continue
            
            required_skills = set([s.lower() for s in job.required_skills])
            match_percentage = (len(student_skills & required_skills) / len(required_skills)) * 100
            
            if match_percentage >= 50:
                matched_count += 1
        
        return matched_count


class JobMatchingService:
    """Service for calculating detailed job match scores"""
    
    @staticmethod
    def calculate_match_breakdown(student: User, job: Job) -> Dict:
        """
        Calculate detailed match scores for a job
        
        Returns:
        - skill_match_percentage
        - experience_match_percentage
        - role_match_percentage
        - final_match_score (weighted average)
        - explanation
        """
        # Skill Match (60% weight)
        profile = student.student_profile
        
        if not profile:
             return {
                'skill_match_percentage': 0,
                'experience_match_percentage': 0,
                'role_match_percentage': 0,
                'final_match_score': 0,
                'matched_skills': [],
                'missing_skills': list(set([s.lower() for s in (job.required_skills or [])])),
                'explanation': "Student profile not found."
            }

        student_skills = set([s.lower() for s in (profile.skills or [])])
        required_skills = set([s.lower() for s in (job.required_skills or [])])
        
        if required_skills:
            matched_skills = student_skills & required_skills
            skill_match_pct = (len(matched_skills) / len(required_skills)) * 100
        else:
            skill_match_pct = 100  # No requirements = perfect match
        
        # Experience Match (25% weight)
        student_exp_years = len(profile.experience_details or [])  # Simplified
        job_exp_required = JobMatchingService._parse_experience_level(job.experience_level)
        
        if student_exp_years >= job_exp_required:
            experience_match_pct = 100
        elif student_exp_years >= job_exp_required * 0.7:
            experience_match_pct = 75
        elif student_exp_years >= job_exp_required * 0.5:
            experience_match_pct = 50
        else:
            experience_match_pct = 25
        
        # Role Match (15% weight)
        student_role = (profile.preferred_job_role or "").lower()
        job_title = (job.title or "").lower()
        
        role_match_pct = 100 if student_role in job_title or job_title in student_role else 50
        
        # Final weighted score
        final_score = (
            skill_match_pct * 0.60 +
            experience_match_pct * 0.25 +
            role_match_pct * 0.15
        )
        
        # Generate explanation
        explanation = JobMatchingService._generate_explanation(
            matched_skills, required_skills - matched_skills,
            skill_match_pct, experience_match_pct, role_match_pct
        )
        
        return {
            'skill_match_percentage': round(skill_match_pct, 1),
            'experience_match_percentage': round(experience_match_pct, 1),
            'role_match_percentage': round(role_match_pct, 1),
            'final_match_score': round(final_score, 1),
            'matched_skills': list(matched_skills),
            'missing_skills': list(required_skills - matched_skills),
            'explanation': explanation
        }
    
    @staticmethod
    def _parse_experience_level(level: str) -> int:
        """Convert experience level string to years"""
        level_lower = level.lower()
        if 'entry' in level_lower or 'junior' in level_lower or 'fresher' in level_lower:
            return 0
        elif 'mid' in level_lower or 'intermediate' in level_lower:
            return 2
        elif 'senior' in level_lower or 'lead' in level_lower:
            return 5
        else:
            return 1
    
    @staticmethod
    def _generate_explanation(matched_skills, missing_skills, skill_pct, exp_pct, role_pct) -> str:
        """Generate human-readable explanation"""
        parts = []
        
        if skill_pct >= 80:
            parts.append(f"You match {len(matched_skills)} out of required skills (excellent fit)")
        elif skill_pct >= 60:
            parts.append(f"You match {len(matched_skills)} required skills (good fit)")
        else:
            parts.append(f"You match {len(matched_skills)} skills but are missing {len(missing_skills)} critical skills")
        
        if exp_pct >= 75:
            parts.append("Your experience level aligns well with requirements")
        else:
            parts.append("Consider gaining more experience in this domain")
        
        if role_pct >= 80:
            parts.append("This role matches your career goals")
        
        return ". ".join(parts) + "."


class ResumeComparisonService:
    """Service for comparing resume versions"""
    
    @staticmethod
    def compare_versions(db: Session, student_id: int, old_version: int, new_version: int) -> Dict:
        """Compare two resume versions"""
        old_resume = db.query(ResumeVersion).filter(
            ResumeVersion.student_id == student_id,
            ResumeVersion.version_number == old_version
        ).first()
        
        new_resume = db.query(ResumeVersion).filter(
            ResumeVersion.student_id == student_id,
            ResumeVersion.version_number == new_version
        ).first()
        
        if not old_resume or not new_resume:
            return {'error': 'Version not found'}
        
        old_skills = set(old_resume.extracted_skills or [])
        new_skills = set(new_resume.extracted_skills or [])
        
        skills_added = list(new_skills - old_skills)
        skills_removed = list(old_skills - new_skills)
        
        score_improvement = (new_resume.resume_score or 0) - (old_resume.resume_score or 0)
        
        return {
            'old_version': old_version,
            'new_version': new_version,
            'skills_added': skills_added,
            'skills_removed': skills_removed,
            'score_improvement': round(score_improvement, 1),
            'old_score': old_resume.resume_score,
            'new_score': new_resume.resume_score,
            'improvement_percentage': round((score_improvement / (old_resume.resume_score or 1)) * 100, 1) if old_resume.resume_score else 0
        }


class TeacherAnalyticsService:
    """Service for teacher dashboard analytics"""
    
    @staticmethod
    def calculate_teacher_metrics(db: Session, teacher_id: int) -> Dict:
        """Calculate comprehensive teacher analytics"""
        # Get all jobs posted by teacher
        jobs = db.query(Job).filter(Job.teacher_id == teacher_id).all()
        job_ids = [job.id for job in jobs]
        
        # Get all applications
        applications = db.query(JobApplication).filter(
            JobApplication.job_id.in_(job_ids)
        ).all()
        
        # Calculate metrics
        total_jobs = len(jobs)
        total_applications = len(applications)
        
        # Average applicant score
        applicant_scores = [
            app.overall_match_score for app in applications
            if app.overall_match_score is not None
        ]
        avg_score = statistics.mean(applicant_scores) if applicant_scores else 0
        
        # Skill demand heatmap
        skill_demand = Counter()
        for job in jobs:
            if job.required_skills:
                skill_demand.update([s.lower() for s in job.required_skills])
        
        top_skills = dict(skill_demand.most_common(10))
        
        # Jobs with no applications
        jobs_no_apps = [job.title for job in jobs if len(job.applications) == 0]
        
        return {
            'total_jobs_posted': total_jobs,
            'total_applications': total_applications,
            'avg_applicant_score': round(avg_score, 1),
            'skill_demand_heatmap': top_skills,
            'jobs_without_applications': jobs_no_apps,
            'application_rate': round(total_applications / total_jobs, 1) if total_jobs > 0 else 0
        }
    
    @staticmethod
    def rank_applicants(db: Session, job_id: int) -> List[Dict]:
        """Rank applicants for a job with explanations"""
        applications = db.query(JobApplication).filter(
            JobApplication.job_id == job_id
        ).all()
        
        ranked = []
        for app in applications:
            student = app.student
            job = app.job
            
            # Calculate scores if not already stored
            if not app.overall_match_score:
                match_data = JobMatchingService.calculate_match_breakdown(student, job)
                app.skill_match_score = match_data['skill_match_percentage']
                app.overall_match_score = match_data['final_match_score']
            
            # Get learning intent (courses completed)
            completed_courses = db.query(CourseProgress).filter(
                CourseProgress.student_id == student.id,
                CourseProgress.status == 'completed'
            ).count()
            
            # Final ranking score
            ranking_score = (
                app.overall_match_score * 0.70 +
                (completed_courses * 5) * 0.20 +  # Learning intent bonus
                (app.teacher_rating or 0) * 4 * 0.10  # Previous rating bonus
            )
            
            ranked.append({
                'application_id': app.id,
                'student_id': student.id,
                'student_name': f"{student.first_name} {student.last_name}",
                'student_email': student.email,
                'ranking_score': round(ranking_score, 1),
                'skill_match': app.skill_match_score,
                'overall_match': app.overall_match_score,
                'courses_completed': completed_courses,
                'status': app.status if isinstance(app.status, str) else app.status.value,
                'explanation': f"Matches {app.skill_match_score}% of required skills. Completed {completed_courses} relevant courses. Overall fit: {app.overall_match_score}%"
            })
        
        # Sort by ranking score
        ranked.sort(key=lambda x: x['ranking_score'], reverse=True)
        
        # Add rank badges
        for idx, applicant in enumerate(ranked):
            if idx == 0:
                applicant['badge'] = 'Top Candidate'
            elif idx < 3:
                applicant['badge'] = 'Strong Fit'
            else:
                applicant['badge'] = 'Consider'
        
        return ranked
