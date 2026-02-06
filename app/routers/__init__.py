
from .auth import router as auth_router
from .users import router as users_router
from .teacher import router as teacher_router
from .jobs import router as jobs_router
from .resume_analysis import router as resume_router
from .chatbot import router as chatbot_router

# Enhanced feature routers (optional, loaded if migrations run)
try:
    from . import student_enhanced
    from . import teacher_enhanced
    from . import chatbot_enhanced
except ImportError:
    pass  # Enhanced features not yet available
