from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from . import models

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Career Platform API")

# CORS Configuration - Universal Mode for Local Dev Reliability
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to Student AI Career Platform API"}

@app.on_event("startup")
async def startup_event():
    print("Server initializing with AI Warm-up...")
    try:
        from .vision.face_service import FaceService
        from .database import SessionLocal
        db = SessionLocal()
        # Warm up Face model so first request is instant
        fs = FaceService()
        fs.build(db=db)
        db.close()
        print("AI Warm-up Complete.")
    except Exception as e:
        print(f"Startup Warning: {e}")

# Simple Logger to track connection health
@app.middleware("http")
async def log_requests(request, call_next):
    print(f"API Hit: {request.method} {request.url}")
    return await call_next(request)

# Include Main Routes (Registration & Core)
from .routes import auth_routes, protected_routes, user_routes, job_routes, resume_routes, profile_routes, teacher_profile_routes, test_routes
app.include_router(auth_routes.router, prefix="/auth", tags=["Authentication"])
app.include_router(protected_routes.router, prefix="/protected", tags=["Protected"])
app.include_router(user_routes.router, prefix="/users", tags=["Users"])
app.include_router(job_routes.router, prefix="/jobs", tags=["Jobs"])
app.include_router(resume_routes.router, prefix="/resumes", tags=["Resumes"])
# Health check route
from .routes import health_routes
app.include_router(health_routes.router, prefix="", tags=["Health"])
app.include_router(profile_routes.router, prefix="/profile", tags=["Student Profile"])
app.include_router(teacher_profile_routes.router, prefix="/teacher-profile", tags=["Teacher Profile"])
app.include_router(test_routes.router, tags=["Automated Tests"])


# AI Modules (Soft Loading: Each isolated to prevent chain failures)
# Important: If one library hangs/fails, others shouldn't.

# 1. AI Vision (FaceLock, Proctoring)
try:
    from .routes import opencv_routes
    app.include_router(opencv_routes.router, prefix="/vision", tags=["AI Vision (OpenCV)"])
    print("AI Vision (FaceLock) ready.")
except Exception as e:
    print(f"FaceLock Import Warning: {e}")

# 2. AI Chatbot (Career Assistant)
try:
    from .routes import chatbot_routes
    app.include_router(chatbot_routes.router, prefix="/chatbot", tags=["AI Chatbot"])
    print("Career Chatbot ready.")
except Exception as e:
    print(f"Chatbot Import Warning: {e}")

# 3. AI Jobs & ML Recs
try:
    from .routes import recommendations, analyzer_routes, ml_routes
    app.include_router(recommendations.router, prefix="/recommendations", tags=["ML Recommendations"])
    app.include_router(analyzer_routes.router, prefix="/analyzer", tags=["Analyzer"])
    app.include_router(ml_routes.router, prefix="/ml", tags=["ML Test"])
    print("ML & Analyzers ready.")
except Exception as e:
    print(f"ML/Analyzer Import Warning: {e}")

print("Platform AI Hub: Online & Biometrics Active.")
