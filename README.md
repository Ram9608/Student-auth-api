# 🎓 Student Authentication & Dashboard System

A complete **Full-Stack Application** featuring a production-ready **FastAPI** backend and a modern **React (Vite)** frontend. This project implements secure user authentication including Login, Registration, Password Reset, and a protected Dashboard with role-based access control.

---

## 🌟 Key Features

### 🔐 Robust Backend (FastAPI)
*   **Secure Authentication**: Implements **JWT (JSON Web Tokens)** for stateless and secure session management.
*   **Password Security**: Uses **Bcrypt** hashing to ensure password safety at rest.
*   **Validation**: Powered by **Pydantic v2** for strict data validation and type checking.
*   **Database**: Built with **SQLAlchemy** (ORM), currently configured with SQLite for development (easily scalable to PostgreSQL).
*   **API Documentation**: Automatic interactive documentation via Swagger UI.

### 💻 Modern Frontend (React + Vite)
*   **Responsive Design**: A sleek, glassmorphism-inspired UI powered by simple CSS and **Framer Motion** for animations.
*   **Context API**: Robust state management for Authentication (`AuthContext`).
*   **Protected Routes**: Security wrappers to prevent unauthorized access to private pages like the Dashboard.
*   **Instant Feedback**: Integrated `react-hot-toast` for real-time user notifications.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Python 3.10+ | Core programming language |
| **Framework** | FastAPI | High-performance async web framework |
| **Frontend** | React (Vite) | Fast, modern frontend library |
| **Database** | SQLite / SQLAlchemy | Relational database management |
| **Security** | PyJWT & Passlib | Token handling and password hashing |
| **Styling** | Vanilla CSS + Lucide | Custom glassmorphism styles and icons |

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Ram9608/Student-auth-api.git
cd Student-auth-api
```

### 2️⃣ Backend Setup
Create a virtual environment and install dependencies.

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

Start the Backend Server:
```bash
python -m uvicorn main:app --reload
```
*   The API will start at `http://127.0.0.1:8000`.
*   **Docs**: Visit `http://127.0.0.1:8000/docs`.

### 3️⃣ Frontend Setup (Optional for Dev)
The frontend is already pre-built and served by FastAPI in this repository. However, if you want to modify the UI:

```bash
cd react_frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```bash
Student-auth-api/
├── main.py              # Application entry point & API routes
├── models.py            # Database models (SQLAlchemy)
├── schemas.py           # Pydantic data schemas
├── security.py          # JWT & Hash utilities
├── database.py          # Database connection
├── react_frontend/      # React Source Code
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth Context Provider
│   │   ├── pages/       # Login, Register, Dashboard
│   │   └── api.ts       # Axios instance
│   └── dist/            # Production build assets (Served by FastAPI)
└── auth.db              # Local Database file
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | Create a new student account |
| **POST** | `/api/v1/auth/login` | Login and receive JWT Token |
| **POST** | `/api/v1/auth/forgot-password` | Request password reset token |
| **GET** | `/api/v1/student/profile` | **[Protected]** Get user profile data |

---

## 🤝 Contribution

Contributions are welcome! If you'd like to improve the UI or add features:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---

### 👨‍💻 Developed by Ram Bhajan Sahu
A passion project demonstrating modern Authentication flows with FastAPI and React.

```python
print("Happy Coding! 🚀")
```
