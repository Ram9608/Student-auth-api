# 🎓 Student & Instructor Auth System (Job Portal)

A production-ready Full-Stack application featuring **JWT Authentication**, **Role-Based Access Control (RBAC)**, and an **Intelligent Job Recommendation Engine**. This platform connects Students with Instructors/Teachers for seamless job posting and application management.

## 🚀 Key Features

### 🔐 Security & Auth
- **JWT Authentication**: Secure token-based auth with auto-refresh potential.
- **RBAC**: Distinct dashboards and permissions for **Students** and **Teachers**.
- **Password Reset**: Secure email-based flow with **One-Time Use Tokens** (Blacklisted after use).
- **Protected Routes**: Middleware enforcement for role-specific API access.

### 👨‍🎓 Student Dashboard
- **Profile Management**: Update skills, education, experience, and social links.
- **Resume Upload**: PDF resume handling with instant dashboard sync.
- **Resume AI Analyzer**: Instant resume-to-job fit analysis using **Set Theory Logic** to identify matching and missing skills.
- **Course Recommendations**: Intelligent **Hybrid Recommendation Engine** that suggests high-quality courses (English & Hindi) from curated sources (Udemy, Coursera) or generates smart fallback search links.
- **AI Chatbot Assistant**: Real-time **Plug-in Style Chatbot** capable of answering queries using **OpenAI**, **Gemini**, or an offline fallback mode (Strategy Pattern).
- **Job Applications**: One-click application to posted opportunities.

### 👩‍🏫 Instructor (Teacher) Dashboard
- **Job Posting**: Create and manage job opportunities with specific skill requirements.
- **Application Tracking**: View list of all students who applied for each job.
- **Resume Viewer**: Directly view or download student resumes (PDF) from the dashboard.

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLite (SQLAlchemy 2.0 ORM)
- **Security**: JWT (python-jose), Bcrypt (passlib)
- **Engine Logic**: Set Operations (O(1) Skill Matching), Hybrid Course Recommender
- **AI Integration**: Strategy Pattern for Multi-Provider LLM Support (OpenAI/Gemini/Fallback)
- **Mailing**: SMTP (Gmail Integration)

### Frontend
- **Framework**: React 18 (Vite + TypeScript)
- **Styling**: Vanilla CSS (Premium Glassmorphism Design)
- **Icons**: Lucide-React
- **State/Auth**: React Context API + Axios Interceptors
- **Animations**: Framer Motion
- **UI/UX**: Premium Dark-Themed Glassmorphism Interface


## 📦 Installation & Setup

### 1. Backend Setup
1. Navigate to the root directory.
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure `.env` file (see `.env.example`):
   ```env
   SECRET_KEY=your_secure_random_key
   SENDER_EMAIL=your-gmail@gmail.com
   SENDER_PASSWORD=your-app-password
   
   # Optional: AI Chatbot Keys (System behaves as offline fallback if missing)
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   ```
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### 2. Frontend Setup
1. Navigate to `react_frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## 📁 Project Structure
```text
.
├── app/
│   ├── core/           # Database & Security configs
│   ├── crud/           # Database operations
│   ├── models/         # SQLAlchemy Models
│   ├── routers/        # API Endpoints (Auth, Jobs, Chatbot)
│   ├── schemas/        # Pydantic validation
│   └── services/       # Resume Analyzer, Chatbot Strategy, Email
├── react_frontend/     # React + Vite TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── pages/      # Dashboards, Login, Reset, etc.
│   │   └── context/    # Auth state management
├── uploads/            # Student Resume Storage
└── main.py             # Entry point
```

## 🛡️ Security Note
Sensitive information like `.env` and `auth.db` are excluded from Git. Ensure you use environment variables for production secrets.

## 📝 License
MIT License. Created by Ram Bhajan Sahu.
