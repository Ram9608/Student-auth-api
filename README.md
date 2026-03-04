# 🎲 CampusDice.ai  
### *AI-Powered Intelligent Assessment & Proctoring Platform*

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.1-orange?style=for-the-badge)](https://groq.com/)

**CampusDice.ai** is a state-of-the-art recruitment and assessment ecosystem designed to streamline the hiring process using advanced Artificial Intelligence. From automated proctoring to intelligent career mentoring, it bridges the gap between students and recruiters.

---

## 🚀 Key Features

### 🛡️ AI Smart Proctoring
*   **Biometric Face Lock**: Facial recognition-based identity verification.
*   **Object Detection**: Real-time detection of restricted items (mobiles, laptops, books) using **YOLOv8**.
*   **Behavioral Analysis**: Monitors student focus and activity during assessments.
*   **Emotion Tracking**: Gauges student engagement using Computer Vision.

### 📄 Intelligent Resume Engine
*   **Skill Extraction**: Automated skill parsing from PDF resumes.
*   **Job Matching**: TF-IDF & Cosine Similarity based matching between resumes and job descriptions.
*   **Skill Gap Analysis**: AI-driven identifies missing skills and recommends tailored learning paths.

### 🤖 CareerAI Chatbot
*   **AI Mentor**: Personalized career advice and roadmap generation.
*   **HR Assistant**: Automated professional feedback and rejection message generation with empathetic AI.

### 📊 Comprehensive Dashboards
*   **Teacher/Recruiter**: Manage jobs, track applications, review student AI proctoring logs, and publish results.
*   **Student**: Build professional profiles, upload resumes, take AI-proctored assessments, and track career progress.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Python, FastAPI, SQLAlchemy |
| **Frontend** | React.js, Tailwind CSS, Lucide Icons |
| **Database** | PostgreSQL / SQLite |
| **AI Models** | YOLOv8 (Object), DeepFace (Vision), Llama 3.1 (LLM via Groq) |
| **Security** | JWT Authentication, Passlib (Hashing), RBAC |

---

## 🏗️ Getting Started

### Prerequisites
*   Python 3.10+
*   Node.js & npm
*   PostgreSQL (optional, defaults to SQLite)
*   **Groq API Key** (for AI features)

### Backend Setup
1.  Navigate to `backend/`
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Configure `.env` file (see `.env.example`)
4.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```

### Frontend Setup
1.  Navigate to `frontend/`
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start development server:
    ```bash
    npm run dev
    ```

---

## 🔒 Security & Privacy
*   **Role-Based Access Control (RBAC)** ensures data privacy between students and instructors.
*   **Secure Password Hashing** using BCrypt/Argon2.
*   **Stateless JWT Authentication** for secure session management.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License
Developed for **CampusDice.ai**. All rights reserved.
