import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session
from app.models.job import Job
from app.models.student import StudentProfile
from app.services.internal_job_service import InternalJobService

class RecommendationEngine:
    def __init__(self, db: Session):
        self.db = db
        self.job_service = InternalJobService(db)

    def recommend_jobs(self, student_id: int, top_n: int = 5):
        print(f"DEBUG: Starting recommendations for student_id: {student_id}")
        
        # 1. Fetch Student Profile
        student_profile = self.db.query(StudentProfile).filter(StudentProfile.user_id == student_id).first()
        if not student_profile:
            print("DEBUG: No student profile found.")
            return []

        # 2. Fetch All Jobs via Internal API
        jobs = self.job_service.get_all_jobs()
        if not jobs:
            print("DEBUG: No jobs found in database.")
            return []

        def normalize_skills(skills_data):
            if not skills_data:
                return []
            if isinstance(skills_data, list):
                # Handle cases where the list contains one large string (common SQLite quirk)
                if len(skills_data) == 1:
                    inner = str(skills_data[0])
                    # Split by comma or space if no commas
                    sep = "," if "," in inner else " "
                    return [s.strip().lower() for s in inner.split(sep) if s.strip()]
                return [str(s).strip().lower() for s in skills_data if s]
            if isinstance(skills_data, str):
                sep = "," if "," in skills_data else " "
                return [s.strip().lower() for s in skills_data.split(sep) if s.strip()]
            return []

        # 4. Prepare Student Data
        student_skills = normalize_skills(student_profile.skills)
        student_role = (student_profile.preferred_job_role or "").lower()
        student_location = (student_profile.city_state or "").lower()
        student_exp = (student_profile.experience_level or "").lower()

        print(f"DEBUG: Normalized Student - Skills: {student_skills}, Role: {student_role}")

        # TF-IDF Preparation
        student_skills_text = " ".join(student_skills)
        job_docs = []
        for job in jobs:
            j_skills = normalize_skills(job.required_skills)
            j_skills_text = " ".join(j_skills)
            # Combine Title + Description + Skills for better ML context
            content = f"{job.title} {job.description} {j_skills_text}".lower()
            job_docs.append(content)

        # Calculate ML Scores
        ml_scores = [0.0] * len(jobs)
        if student_skills_text.strip() and job_docs:
            try:
                corpus = [student_skills_text] + job_docs
                vectorizer = TfidfVectorizer(stop_words='english')
                tfidf_matrix = vectorizer.fit_transform(corpus)
                cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
                ml_scores = cosine_sim[0]
            except Exception as e:
                print(f"DEBUG: ML calculation error: {str(e)}")

        # 5. Hybrid Scoring
        job_scores = []
        for i, job in enumerate(jobs):
            # Base score from ML (scaled to 0-50)
            score = ml_scores[i] * 50
            
            # Boost: Title Match (Role similarity)
            if student_role:
                if student_role in job.title.lower():
                    score += 30
                elif any(word in job.title.lower() for word in student_role.split()):
                    score += 15
            
            # Boost: Skill Match (Explicitly check overlaps)
            j_skills = normalize_skills(job.required_skills)
            if student_skills and j_skills:
                matching_skills = set(student_skills) & set(j_skills)
                if matching_skills:
                    score += (len(matching_skills) / len(j_skills)) * 20

            # Boost: Location
            if student_location and student_location in (job.location or "").lower():
                score += 10

            # Boost: Experience
            if student_exp and job.experience_level:
                s_exp_key = student_exp.split()[0].lower()
                if s_exp_key in job.experience_level.lower():
                    score += 10

            job_scores.append((job, score))

        # 6. Sort and Return
        job_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Filter: If best score is 0, fallback to recent
        if not job_scores or job_scores[0][1] == 0:
            print("DEBUG: No relevant matches. Returning recent jobs.")
            recommended_jobs = sorted(jobs, key=lambda x: x.created_at, reverse=True)[:top_n]
        else:
            recommended_jobs = [item[0] for item in job_scores if item[1] > 0][:top_n]

        print(f"DEBUG: Returning {len(recommended_jobs)} recommendations.")
        return recommended_jobs
