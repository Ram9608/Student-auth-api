from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
import datetime
import random

from app.database import get_db
from app.models import Test, TestResult, User, StudentProfile
from app.core.dependencies import teacher_only, get_current_user

router = APIRouter()

# ----------------- TEACHER ENDPOINTS -----------------

@router.post("/teacher/generate-test/{student_id}")
def generate_test(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(teacher_only)):
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == student_id).first()
    skills = profile.technical_skills.lower() if profile and profile.technical_skills else ""
    
    # Logic to determine category based on skills
    title = "Technical Assessment"
    questions = []
    
    # Categories: AIML, Web Dev, Data Science
    if any(k in skills for k in ["ml", "ai", "machine learning", "deep learning", "nlp", "computer vision"]):
        title = "AI/ML & Python Technical Assessment"
        questions = [
            {"q": "What is the primary difference between Supervised and Unsupervised Learning?", "options": ["Supervised uses labeled data", "Unsupervised is faster", "Supervised doesn't need data", "No difference"], "correct": 0},
            {"q": "Which of these is a popular deep learning framework?", "options": ["Django", "TensorFlow", "Pandas", "Flask"], "correct": 1},
            {"q": "What does 'Backpropagation' do?", "options": ["Optimizes weights to reduce error", "Initializes the model", "Cleans the dataset", "Stops the training"], "correct": 0},
            {"q": "What is an epoch in ML?", "options": ["One pass through the entire dataset", "One batch of data", "One single iteration", "The final accuracy score"], "correct": 0},
            {"q": "Which algorithm is used for classification?", "options": ["Linear Regression", "Logistic Regression", "K-Means", "PCA"], "correct": 1}
        ]
    elif any(k in skills for k in ["web", "html", "css", "js", "react", "node", "frontend", "backend"]):
        title = "Web Development (Full Stack) Assessment"
        questions = [
            {"q": "What does a 'closure' in JavaScript do?", "options": ["Closes the browser window", "Allows internal functions to access variables of parent scope", "Ends a loop", "Cleans the memory"], "correct": 1},
            {"q": "What is the use of 'useEffect' in React?", "options": ["To handle side effects like API calls", "To style components", "To define routes", "To create a Redux store"], "correct": 0},
            {"q": "Which HTTP method is used to send sensitive data like passwords?", "options": ["GET", "POST", "HEAD", "OPTIONS"], "correct": 1},
            {"q": "What does 'semantic HTML' mean?", "options": ["Using tags that describe their content", "Using only <div> and <span>", "HTML with CSS", "HTML with AI"], "correct": 0},
            {"q": "Which CSS property is used for layouts?", "options": ["margin", "flexbox", "padding", "border"], "correct": 1}
        ]
    elif any(k in skills for k in ["sql", "pandas", "data", "tableau", "bi", "analytics"]):
        title = "Data Science & SQL Analytics Assessment"
        questions = [
            {"q": "Which SQL keyword is used to sort results?", "options": ["SORT", "ORDER BY", "GROUP BY", "ASC"], "correct": 1},
            {"q": "What is a 'DataFrame' in Pandas?", "options": ["A 2D labeled data structure", "A 1D array", "A database connection", "A graph"], "correct": 0},
            {"q": "What is the purpose of 'StandardScaler'?", "options": ["To scale data to mean 0 and variance 1", "To remove outliers", "To fill missing values", "To sort data"], "correct": 0},
            {"q": "Which SQL join returns all records when there is a match in either left or right table?", "options": ["Inner Join", "Left Join", "Right Join", "Full Outer Join"], "correct": 3},
            {"q": "What is 'EDA' in Data Science?", "options": ["Electronic Data Access", "Exploratory Data Analysis", "Efficient Data Aggregation", "None"], "correct": 1}
        ]
    else:
        title = "General Software Engineering Aptitude"
        questions = [
            {"q": "Which data structure follows LIFO?", "options": ["Queue", "Stack", "Tree", "Graph"], "correct": 1},
            {"q": "What is the time complexity of binary search?", "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"], "correct": 1},
            {"q": "What does API stand for?", "options": ["Application Programming Interface", "Auto Program Integration", "Advanced Player Info", "None"], "correct": 0},
            {"q": "What is Git?", "options": ["A programming language", "A version control system", "A cloud provider", "A database"], "correct": 1},
            {"q": "Which service is used for deployment?", "options": ["VS Code", "GitHub Actions / Docker", "Excel", "Notepad"], "correct": 1}
        ]

    new_test = Test(
        student_id=student_id,
        teacher_id=current_user.id,
        title=title,
        questions=json.dumps(questions),
        duration=30,
        monitoring_required=True
    )
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    return {"message": "Test generated successfully!", "test_id": new_test.id, "title": title}

@router.get("/teacher/student-tests/{student_id}")
def get_student_tests(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(teacher_only)):
    tests = db.query(Test).filter(Test.student_id == student_id).all()
    results = []
    for t in tests:
        res = db.query(TestResult).filter(TestResult.test_id == t.id).first()
        results.append({
            "id": t.id,
            "result_id": res.id if res else None,
            "title": t.title,
            "created_at": str(t.created_at),
            "status": "Completed" if res else "Pending",
            "score": res.score if res else None,
            "warnings_count": res.warnings_count if res else None,
            "feedback": res.feedback if res else None,
            "is_published": res.is_published if res else False
        })
    return results

@router.post("/teacher/publish-result/{result_id}")
def publish_result(result_id: int, data: dict, db: Session = Depends(get_db), current_user: User = Depends(teacher_only)):
    result = db.query(TestResult).filter(TestResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    result.feedback = data.get("feedback", "")
    result.is_published = True
    db.commit()
    return {"message": "Result announced successfully with feedback!"}

@router.get("/student/my-tests")
def get_my_tests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tests = db.query(Test).filter(Test.student_id == current_user.id).all()
    results = []
    for t in tests:
        res = db.query(TestResult).filter(TestResult.test_id == t.id).first()
        results.append({
            "id": t.id,
            "title": t.title,
            "questions": json.loads(t.questions),
            "duration": t.duration,
            "monitoring_required": t.monitoring_required,
            "status": "Completed" if res else "Pending",
            "score": res.score if (res and res.is_published) else None,
            "warnings_count": res.warnings_count if res else 0,
            "feedback": res.feedback if (res and res.is_published) else "Review in progress...",
            "is_published": res.is_published if res else False,
            "submitted_at": str(res.submitted_at) if res else None
        })
    return results

@router.post("/student/submit-test")
def submit_test(data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    test_id = data.get("test_id")
    score = data.get("score")
    warnings = data.get("warnings_count", 0)
    
    existing = db.query(TestResult).filter(TestResult.test_id == test_id, TestResult.student_id == current_user.id).first()
    if existing:
        return {"message": "Test already submitted."}
        
    result = TestResult(
        test_id=test_id,
        student_id=current_user.id,
        score=score,
        warnings_count=warnings,
        is_published=False # Teacher must review first
    )
    db.add(result)
    db.commit()
    return {"message": "Test submitted successfully! Waiting for instructor review."}
