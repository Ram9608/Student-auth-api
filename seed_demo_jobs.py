"""
Script to seed demo jobs into database
Run this to populate database with sample jobs for testing
"""

from app.core.database import SessionLocal
from app.models.job import Job
from app.models.user import User
from datetime import datetime

def seed_demo_jobs():
    db = SessionLocal()
    
    try:
        # Find or create a teacher user
        teacher = db.query(User).filter(User.role == 'teacher').first()
        
        if not teacher:
            print("❌ No teacher found in database! Please create a teacher account first.")
            return
        
        print(f"✅ Using teacher: {teacher.email} (ID: {teacher.id})")
        
        # Demo jobs data
        demo_jobs = [
            {
                "title": "Python Backend Developer",
                "company": "Tech Solutions Inc",
                "description": "We are looking for a skilled Python developer with expertise in FastAPI and database management.",
                "location": "Remote",
                "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
                "experience_level": "1-3 Years",
                "teacher_id": teacher.id
            },
            {
                "title": "Full Stack Developer",
                "company": "WebCraft Studios",
                "description": "Join our team to build amazing web applications using React and Node.js.",
                "location": "Mumbai, India",
                "required_skills": ["React", "Node.js", "MongoDB", "TypeScript"],
                "experience_level": "1-3 Years",
                "teacher_id": teacher.id
            },
            {
                "title": "Data Scientist",
                "company": "AI Innovations Lab",
                "description": "Work on cutting-edge machine learning projects and data analysis.",
                "location": "Bangalore, India",
                "required_skills": ["Python", "Machine Learning", "TensorFlow", "Pandas", "SQL"],
                "experience_level": "3-5 Years",
                "teacher_id": teacher.id
            },
            {
                "title": "DevOps Engineer",
                "company": "Cloud Systems Corp",
                "description": "Manage cloud infrastructure and implement CI/CD pipelines.",
                "location": "Pune, India",
                "required_skills": ["AWS", "Docker", "Kubernetes", "Jenkins", "Python"],
                "experience_level": "3-5 Years",
                "teacher_id": teacher.id
            },
            {
                "title": "Frontend Developer",
                "company": "Design First Ltd",
                "description": "Create beautiful and responsive user interfaces using modern frameworks.",
                "location": "Remote",
                "required_skills": ["React", "JavaScript", "CSS", "HTML", "Redux"],
                "experience_level": "Fresher",
                "teacher_id": teacher.id
            },
            {
                "title": "Mobile App Developer",
                "company": "AppMakers Inc",
                "description": "Develop cross-platform mobile applications using React Native.",
                "location": "Delhi, India",
                "required_skills": ["React Native", "JavaScript", "Firebase", "Redux"],
                "experience_level": "1-3 Years",
                "teacher_id": teacher.id
            },
            {
                "title": "Java Developer",
                "company": "Enterprise Solutions",
                "description": "Build robust enterprise applications using Java and Spring Boot.",
                "location": "Hyderabad, India",
                "required_skills": ["Java", "Spring Boot", "MySQL", "Microservices"],
                "experience_level": "3-5 Years",
                "teacher_id": teacher.id
            },
            {
                "title": "UI/UX Designer",
                "company": "Creative Minds",
                "description": "Design intuitive and beautiful user experiences for web and mobile apps.",
                "location": "Remote",
                "required_skills": ["Figma", "Adobe XD", "User Research", "Wireframing"],
                "experience_level": "1-3 Years",
                "teacher_id": teacher.id
            },
            {
                "title": "Machine Learning Engineer",
                "company": "DeepTech AI",
                "description": "Build and deploy ML models for real-world applications.",
                "location": "Bangalore, India",
                "required_skills": ["Python", "TensorFlow", "PyTorch", "Deep Learning", "NLP"],
                "experience_level": "3-5 Years",
                "teacher_id": teacher.id
            },
            {
                "title": "Cyber Security Analyst",
                "company": "SecureNet Systems",
                "description": "Protect our systems from cyber threats and vulnerabilities.",
                "location": "Mumbai, India",
                "required_skills": ["Security", "Network", "Penetration Testing", "Python"],
                "experience_level": "3-5 Years",
                "teacher_id": teacher.id
            },
            {
                "title": "QA Automation Engineer",
                "company": "Quality First Labs",
                "description": "Automate testing processes and ensure software quality.",
                "location": "Pune, India",
                "required_skills": ["Selenium", "Python", "API Testing", "CI/CD"],
                "experience_level": "1-3 Years",
                "teacher_id": teacher.id
            },
            {
                "title": "Blockchain Developer",
                "company": "CryptoWorks Inc",
                "description": "Develop decentralized applications and smart contracts.",
                "location": "Remote",
                "required_skills": ["Solidity", "Ethereum", "Web3.js", "JavaScript"],
                "experience_level": "3-5 Years",
                "teacher_id": teacher.id
            },
            {
                "title": "Game Developer",
                "company": "GameStudio Pro",
                "description": "Create engaging games using Unity or Unreal Engine.",
                "location": "Bangalore, India",
                "required_skills": ["Unity", "C#", "Game Design", "3D Modeling"],
                "experience_level": "1-3 Years",
                "teacher_id": teacher.id
            },
            {
                "title": "Cloud Architect",
                "company": "CloudFirst Solutions",
                "description": "Design and implement cloud-based solutions and architectures.",
                "location": "Mumbai, India",
                "required_skills": ["AWS", "Azure", "Cloud Architecture", "Terraform"],
                "experience_level": "5+ Years",
                "teacher_id": teacher.id
            },
            {
                "title": "Software Development Intern",
                "company": "StartUp Ventures",
                "description": "Learn and grow with our team while working on real projects.",
                "location": "Remote",
                "required_skills": ["Python", "JavaScript", "Git", "Problem Solving"],
                "experience_level": "Fresher",
                "teacher_id": teacher.id
            }
        ]
        
        # Check existing jobs count
        existing_count = db.query(Job).count()
        print(f"📊 Current jobs in database: {existing_count}")
        
        # Add jobs
        added_count = 0
        for job_data in demo_jobs:
            # Check if similar job already exists
            existing = db.query(Job).filter(
                Job.title == job_data["title"],
                Job.company == job_data["company"]
            ).first()
            
            if existing:
                print(f"⏭️  Skipping '{job_data['title']}' at {job_data['company']} (already exists)")
                continue
            
            # Create new job
            new_job = Job(**job_data)
            db.add(new_job)
            added_count += 1
            print(f"✅ Added: {job_data['title']} at {job_data['company']}")
        
        db.commit()
        
        # Final count
        final_count = db.query(Job).count()
        
        print(f"\n🎉 Done!")
        print(f"📈 Jobs added: {added_count}")
        print(f"📊 Total jobs in database: {final_count}")
        
        if added_count > 0:
            print(f"\n✅ Success! Refresh your browser to see {final_count} jobs in the 'All Jobs' tab!")
        else:
            print(f"\n✅ All demo jobs already exist. You have {final_count} jobs available.")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🌱 Seeding demo jobs into database...\n")
    seed_demo_jobs()
