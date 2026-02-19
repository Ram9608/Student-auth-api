from sqlalchemy.orm import Session
from app.models.job import Job
from app.models.student import StudentProfile
from app.schemas.resume_analysis import ResumeAnalysisResponse, CourseRecommendation
import json
import os
from app.core.groq import groq_client

# Database of high-quality, free/affordable resources for common skills
SKILL_RESOURCES = {
    "python": [
        {"title": "Python for Everybody", "platform": "Coursera", "url": "https://www.coursera.org/specializations/python", "level": "Beginner", "language": "English"},
        {"title": "100 Days of Code: The Complete Python Pro Bootcamp", "platform": "Udemy", "url": "https://www.udemy.com/course/100-days-of-code/", "level": "Beginner", "language": "English"},
        {"title": "Python Tutorial for Beginners (Hindi)", "platform": "YouTube (CodeWithHarry)", "url": "https://www.youtube.com/playlist?list=PLu0W_9lII9agwh1XjRt242xIpHhPT2llg", "level": "Beginner", "language": "Hindi"},
        {"title": "Python Full Course in Hindi", "platform": "YouTube (Great Learning)", "url": "https://www.youtube.com/watch?v=bi_I9tsQdCg", "level": "Beginner", "language": "Hindi"}
    ],
    "react": [
        {"title": "React - The Complete Guide", "platform": "Udemy", "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", "level": "Intermediate", "language": "English"},
        {"title": "React Course - Beginner's Tutorial", "platform": "YouTube (freeCodeCamp)", "url": "https://www.youtube.com/watch?v=bMknfKXIFA8", "level": "Beginner", "language": "English"},
        {"title": "React JS Tutorial in Hindi", "platform": "YouTube (Thapa Technical)", "url": "https://www.youtube.com/playlist?list=PLwGdqUZWnLXOKO0TS24hP65q05eTaP7P_", "level": "Beginner", "language": "Hindi"}
    ],
    "javascript": [
        {"title": "JavaScript Algorithms and Data Structures", "platform": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "level": "Beginner", "language": "English"},
        {"title": "Namaste JavaScript", "platform": "YouTube (Akshay Saini)", "url": "https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP", "level": "Intermediate", "language": "English"},
        {"title": "JavaScript Tutorial in Hindi", "platform": "YouTube (CodeWithHarry)", "url": "https://www.youtube.com/playlist?list=PLu0W_9lII9ajyk081To1Cbt2eI5913c_e", "level": "Beginner", "language": "Hindi"}
    ],
    "sql": [
        {"title": "SQL for Data Science", "platform": "Coursera", "url": "https://www.coursera.org/learn/sql-for-data-science", "level": "Beginner", "language": "English"},
        {"title": "SQL Tutorial - Full Database Course", "platform": "YouTube (freeCodeCamp)", "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY", "level": "Beginner", "language": "English"},
        {"title": "SQL Tutorial in Hindi", "platform": "YouTube (Great Learning)", "url": "https://www.youtube.com/watch?v=Dk7zP8c0lSc", "level": "Beginner", "language": "Hindi"}
    ],
    "fastapi": [
        {"title": "FastAPI - The Complete Course", "platform": "Udemy", "url": "https://www.udemy.com/course/fastapi-the-complete-course/", "level": "Intermediate", "language": "English"},
        {"title": "FastAPI Tutorial", "platform": "YouTube (Bitfumes)", "url": "https://www.youtube.com/watch?v=7t2alSnE2-I", "level": "Beginner", "language": "English"},
        {"title": "FastAPI Python Tutorial (Hindi)", "platform": "YouTube (CodeWithHarry)", "url": "https://www.youtube.com/watch?v=tLqyn4kBjL0", "level": "Beginner", "language": "Hindi"}
    ],
    "docker": [
        {"title": "Docker for Beginners", "platform": "YouTube (TechWorld with Nana)", "url": "https://www.youtube.com/watch?v=3c-iBn73dDE", "level": "Beginner", "language": "English"},
        {"title": "Docker Tutorial In Hindi", "platform": "YouTube (WSCube Tech)", "url": "https://www.youtube.com/watch?v=eGz9DS-aIeY", "level": "Beginner", "language": "Hindi"}
    ],
    "aws": [
        {"title": "AWS Cloud Practitioner Essentials", "platform": "AWS / Coursera", "url": "https://www.coursera.org/learn/aws-cloud-practitioner-essentials", "level": "Beginner", "language": "English"},
        {"title": "AWS Tutorial For Beginners In Hindi", "platform": "YouTube (Simplilearn)", "url": "https://www.youtube.com/watch?v=k1ri4r7aMKo", "level": "Beginner", "language": "Hindi"}
    ],
    "git": [
        {"title": "Git and GitHub for Beginners", "platform": "YouTube (Amigoscode)", "url": "https://www.youtube.com/watch?v=gwWKnnCMQ5c", "level": "Beginner", "language": "English"},
        {"title": "Git and GitHub Tutorial in Hindi", "platform": "YouTube (CodeWithHarry)", "url": "https://www.youtube.com/playlist?list=PLu0W_9lII9agwh1XjRt242xIpHhPT2llg", "level": "Beginner", "language": "Hindi"}
    ]
}

class ResumeAnalyzerService:
    def __init__(self, db: Session):
        self.db = db

    def normalize_skills(self, skills_data) -> list[str]:
        # Helper to normalize skills (copied to ensure independence)
        if not skills_data:
            return []
            
        normalized = []
        
        try:
            if isinstance(skills_data, list):
                # Handle list of strings
                for item in skills_data:
                    # Handle potential comma-separated strings inside list
                    if isinstance(item, str) and "," in item:
                         normalized.extend([s.strip().lower() for s in item.split(",") if s.strip()])
                    else:
                        normalized.append(str(item).strip().lower())
                        
            elif isinstance(skills_data, str):
                # Handle string representation of list or comma-separated string
                clean_str = skills_data.strip()
                
                # Remove brackets if it looks like a stringified list
                if clean_str.startswith("[") and clean_str.endswith("]"):
                    clean_str = clean_str[1:-1]
                    
                # Remove quotes
                clean_str = clean_str.replace("'", "").replace('"', "")
                
                sep = "," if "," in clean_str else " "
                normalized = [s.strip().lower() for s in clean_str.split(sep) if s.strip()]
        except Exception as e:
            print(f"Error normalizing skills: {e}")
            return []
            
        return list(set(normalized)) # Return unique skills

    def analyze(self, student_id: int, job_id: int) -> ResumeAnalysisResponse:
        # 1. Fetch Data
        student = self.db.query(StudentProfile).filter(StudentProfile.user_id == student_id).first()
        job = self.db.query(Job).filter(Job.id == job_id).first()

        if not student or not job:
            raise ValueError("Student or Job not found")

        # 2. Skill Logic (Deterministic)
        student_skills = set(self.normalize_skills(student.skills))
        job_skills = set(self.normalize_skills(job.required_skills))

        matched = list(student_skills.intersection(job_skills))
        missing = list(job_skills.difference(student_skills))

        # 3. Validation Logic
        # Score = (Matched / Total Required) * 100
        score = 0.0
        if job_skills:
            score = (len(matched) / len(job_skills)) * 100
        score = round(score, 1)

        # 4. Generate AI/Logic Feedback
        explanation = f"You matched {len(matched)} out of {len(job_skills)} required skills."
        
        # 5. Course Recommendations (Static for now, can be AI)
        courses = self._get_course_recommendations(missing)

        # 6. AI Suggestions (Mock implementation or Placehoder)
        suggestions = self._get_ai_suggestions(student_skills, job_skills, job.title)

        return ResumeAnalysisResponse(
            job_id=job.id,
            job_title=job.title,
            match_score=score,
            matched_skills=matched,
            missing_skills=missing,
            explanation=explanation,
            ai_improvement_suggestions=suggestions,
            recommended_courses=courses
        )

    def generate_rejection_reason(self, student_id: int, job_id: int) -> str:
        try:
            analysis = self.analyze(student_id, job_id)
            if analysis.match_score < 60:
                missing = analysis.missing_skills[:2]
                return f"AI Feedback: Skill match score is low ({analysis.match_score}%). We are specifically looking for skills like {', '.join(missing)} which seem to be missing from your profile."
            return "AI Feedback: While your skills are good, we had other candidates with more specific experience in the required domain."
        except:
            return "Unfortunately, our current requirements are not a perfect match for your profile."

    def _get_ai_suggestions(self, student_skills, job_skills, job_title) -> list[str]:
        # This is where the LLM Integration happens.
        # Step 6 Requirement: "Use LLM ONLY for... improvements... explanation"
        
        prompt = f"""
        Act as a Career Coach.
        Job: {job_title}
        Student Skills: {', '.join(student_skills)}
        Missing Skills: {', '.join(job_skills.difference(student_skills))}
        
        Provide 3 specific resume improvement tips.
        Return ONLY a JSON object with a key "tips" containing a list of strings.
        Example: {{"tips": ["Tip 1", "Tip 2", "Tip 3"]}}
        """
        
        try:
            result = groq_client.extract_json(prompt)
            if result and "tips" in result:
                return result["tips"]
        except Exception as e:
            print(f"AI Suggestion Error: {e}")
            
        return [
            "Tailor your resume headline to mention 'Aspiring " + job_title + "'.",
            "Highlight projects that demonstrate " + (list(job_skills)[0] if job_skills else "relevant skills") + ".",
            "Add a 'Key Competencies' section to your resume."
        ]

    def _get_course_recommendations(self, missing_skills: list[str]) -> list[CourseRecommendation]:
        recommendations = []
        # Limit to top 3 missing skills to avoid overwhelming the user
        for skill in missing_skills[:3]:
            # Check if we have a curated resource
            resources = SKILL_RESOURCES.get(skill.lower())
            
            if resources:
                # Add ALL curated resources for this skill (English & Hindi)
                for res in resources:
                    recommendations.append(CourseRecommendation(
                        skill=skill,
                        course_name=res["title"],
                        platform=res["platform"],
                        course_url=res["url"],
                        level=res["level"],
                        language=res.get("language", "English")
                    ))
            else:
                # Fallback: Generate smart search links for both YouTube and Udemy
                # Default to English for fallback
                recommendations.append(CourseRecommendation(
                    skill=skill,
                    course_name=f"Learn {skill.title()} on YouTube",
                    platform="YouTube",
                    course_url=f"https://www.youtube.com/results?search_query={skill}+course+beginner",
                    level="Beginner",
                    language="English"
                ))
                recommendations.append(CourseRecommendation(
                    skill=skill,
                    course_name=f"Learn {skill.title()} on Udemy",
                    platform="Udemy",
                    course_url=f"https://www.udemy.com/courses/search/?q={skill}&price=price-free&sort=highest-rated",
                    level="Beginner",
                    language="English"
                ))
                recommendations.append(CourseRecommendation(
                    skill=skill,
                    course_name=f"Learn {skill.title()} in Hindi",
                    platform="YouTube",
                    course_url=f"https://www.youtube.com/results?search_query={skill}+course+hindi+beginner",
                    level="Beginner",
                    language="Hindi"
                ))
        
        return recommendations
