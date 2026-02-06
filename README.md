# 🎓 AI-Powered Student Job Portal

A comprehensive job portal platform designed specifically for students, powered by AI to match students with the perfect job opportunities based on their skills and profile.

## ✨ Features

### 👨‍🎓 For Students
- ✅ **Smart Profile Management** - Complete profile with education, skills, projects, and experience
- ✅ **Resume Upload & Analysis** - AI-powered resume parsing and skill extraction
- ✅ **Personalized Job Recommendations** - AI matches you with relevant jobs based on your profile
- ✅ **Resume-Job Fit Analysis** - See your match score and missing skills for each job
- ✅ **One-Click Job Applications** - Apply to jobs instantly with validation checks
- ✅ **AI Career Chatbot** - Get career guidance and skill recommendations
- ✅ **Course Recommendations** - Get personalized course suggestions to improve your skills

### 👨‍🏫 For Teachers/Recruiters
- ✅ **Easy Job Posting** - Post job opportunities with detailed requirements
- ✅ **Application Management** - View all applicants for your posted jobs
- ✅ **Shortlist & Reject** - Manage candidate status efficiently
- ✅ **Resume Downloads** - Download student resumes in PDF format
- ✅ **Applicant Insights** - View student profiles and application details

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Bcrypt password hashing, Role-Based Access Control (RBAC)

### Frontend
- **Framework:** React (TypeScript)
- **Build Tool:** Vite
- **Styling:** Custom CSS with Glassmorphism design
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

### AI Features
- **Resume Analysis:** NLP-based skill extraction
- **Job Matching:** Skill-based recommendation engine
- **Chatbot:** AI-powered career guidance (OpenAI/Gemini)
- **Course Recommendations:** Skill gap analysis with course suggestions

## 📦 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/Ram9608/Student-auth-api.git
cd Student-auth-api
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Setup PostgreSQL database**
```bash
# Create database
createdb student_auth_db
```

5. **Configure environment variables**
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your configuration
# - Database credentials
# - JWT secret key
# - Email credentials (optional)
# - AI API keys (optional)
```

6. **Run database migrations**
```bash
# Tables will be created automatically on first run
# Or run: python migrate_enhanced_features.py
```

7. **Seed demo jobs (optional)**
```bash
python seed_demo_jobs.py
```

8. **Start the backend server**
```bash
uvicorn main:app --reload
```

Backend will run on: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd react_frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

Frontend will run on: `http://localhost:5173/` or `http://localhost:5174/`

## 🚀 Usage

### 1. Register an Account
- Visit `http://localhost:5173/`
- Click "Register"
- Choose role: **Student** or **Teacher**
- Fill in details and submit

### 2. Student Workflow
1. **Complete Profile**
   - Add skills, education, projects
   - Upload resume (PDF)
   
2. **Browse Jobs**
   - View personalized recommendations in "For You" tab
   - Browse all jobs in "All Jobs" tab
   
3. **Analyze Fit**
   - Click "Analyze Fit" on any job
   - See match score and missing skills
   - Get course recommendations
   
4. **Apply**
   - Click "Apply Now" to submit application
   - Track application status

### 3. Teacher/Recruiter Workflow
1. **Post Jobs**
   - Click "Post a Job"
   - Fill job details (title, company, skills, etc.)
   - Submit
   
2. **Manage Applications**
   - View "My Jobs"
   - Click "View Applications" on any job
   - See applicant details
   
3. **Review Candidates**
   - Download resumes
   - Shortlist promising candidates
   - Reject unsuitable applicants

## 📁 Project Structure

```
student_auth_api/
├── app/
│   ├── core/           # Configuration, database, security
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   ├── crud/           # Database operations
│   ├── routers/        # API endpoints
│   ├── services/       # Business logic (AI, email, etc.)
│   └── utils/          # Helper functions
├── react_frontend/
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   ├── pages/      # Dashboard pages
│   │   ├── context/    # Auth context
│   │   └── api.ts      # Axios configuration
│   └── public/         # Static assets
├── uploads/            # User-uploaded resumes
├── main.py             # FastAPI application entry
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variables template
└── README.md           # This file
```

## 🔐 Security Features

- ✅ **Password Hashing:** Bcrypt for secure password storage
- ✅ **JWT Authentication:** Stateless token-based auth
- ✅ **Role-Based Access Control (RBAC):** Student/Teacher permissions
- ✅ **Protected Routes:** Authorization checks on sensitive endpoints
- ✅ **Input Validation:** Pydantic schemas for request validation
- ✅ **CORS Configuration:** Secure cross-origin requests
- ✅ **SQL Injection Prevention:** SQLAlchemy ORM with parameterized queries

## 🎨 UI/UX Features

- ✅ **Glassmorphism Design:** Modern, premium look
- ✅ **Smooth Animations:** Framer Motion for delightful interactions
- ✅ **Responsive Layout:** Works on desktop, tablet, and mobile
- ✅ **Dark Theme:** Easy on the eyes
- ✅ **Toast Notifications:** Real-time user feedback
- ✅ **Loading States:** Clear feedback during async operations

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user info

### Student
- `GET /api/v1/student/profile` - Get student profile
- `POST /api/v1/student/profile` - Create/Update profile
- `POST /api/v1/student/resume` - Upload resume
- `GET /api/v1/jobs/recommendations` - Get personalized job matches
- `POST /api/v1/jobs/{id}/apply` - Apply to job
- `POST /api/v1/resume-analyzer/analyze/{job_id}` - Analyze job fit

### Teacher
- `POST /api/v1/teacher/jobs` - Post new job
- `GET /api/v1/teacher/jobs` - Get posted jobs
- `GET /api/v1/teacher/jobs/{id}/applications` - View applications
- `PATCH /api/v1/teacher/applications/{id}/status` - Update application status

### Jobs
- `GET /api/v1/jobs` - Get all jobs
- `GET /api/v1/jobs/recommendations` - AI-recommended jobs

### Chatbot
- `POST /api/v1/chatbot/query` - Ask career questions

Full API documentation available at: `http://localhost:8000/docs`

## 🤖 AI Integration

### Resume Analyzer
- Extracts skills from PDF resumes
- Calculates match scores
- Identifies skill gaps
- Recommends improvement areas

### Job Recommendation Engine
- Matches students with jobs based on:
  - Skills compatibility
  - Experience level
  - Preferred job role
  - Location preferences

### Career Chatbot
- Powered by OpenAI GPT or Google Gemini
- Provides career guidance
- Answers skill-related questions
- Fallback mechanism if API keys not configured

## 🗄️ Database Schema

### Users Table
- Authentication credentials
- Role (student/teacher)
- Basic info (name, email, phone)

### Student Profiles
- Detailed profile data
- Skills, education, projects
- Resume path
- Preferences

### Jobs Table
- Job details
- Required skills
- Posted by teacher
- Application status tracking

### Job Applications
- Student-job mapping
- Application status
- Timestamp tracking

## 🧪 Testing

The application includes comprehensive testing:
- ✅ Authentication flows
- ✅ Profile management
- ✅ Job recommendations
- ✅ Application workflows
- ✅ RBAC enforcement
- ✅ Security validation

## 🚀 Deployment

### Production Checklist
- [ ] Update `.env` with production credentials
- [ ] Set `DEBUG=False`
- [ ] Use strong JWT secret
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure CORS for production domain
- [ ] Set up email service (Gmail SMTP or SendGrid)
- [ ] Add AI API keys for full functionality

### Deployment Options
- **Backend:** Heroku, Railway, Render, AWS EC2
- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
- **Database:** PostgreSQL on AWS RDS, Heroku Postgres

## 📝 Environment Variables

See `.env.example` for all available configuration options:
- Database connection
- JWT configuration
- Email service
- AI API keys
- Application settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support:
- GitHub: [@Ram9608](https://github.com/Ram9608)
- Email: ramsc266@gmail.com

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- FastAPI for the excellent Python framework
- React team for the frontend library
- OpenAI & Google for AI capabilities
- All contributors and testers

---

**Made with ❤️ for students seeking their dream jobs!**
