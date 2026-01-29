# 🎓 Student Authentication & Dashboard System

A complete **Full-Stack Application** featuring a production-ready **FastAPI** backend and a modern **React (Vite + TypeScript)** frontend. This project implements secure user authentication including Login, Registration, Email-based Password Reset, and a protected Dashboard with role-based access control.

---

## 🌟 Key Features

### 🔐 Robust Backend (FastAPI)
*   **Secure Authentication**: Implements **JWT (JSON Web Tokens)** for stateless and secure session management.
*   **Password Security**: Uses **Bcrypt** hashing to ensure password safety at rest.
*   **Email Integration**: Gmail SMTP integration for password reset functionality with secure token-based reset links.
*   **Validation**: Powered by **Pydantic v2** for strict data validation and type checking.
*   **Database**: Built with **SQLAlchemy** (ORM), currently configured with SQLite for development (easily scalable to PostgreSQL).
*   **API Documentation**: Automatic interactive documentation via Swagger UI.
*   **API Versioning**: Clean API structure with `/api/v1` versioning.

### 💻 Modern Frontend (React + Vite + TypeScript)
*   **Responsive Design**: A sleek, glassmorphism-inspired UI powered by custom CSS and **Framer Motion** for smooth animations.
*   **Context API**: Robust state management for Authentication (`AuthContext`).
*   **Protected Routes**: Security wrappers to prevent unauthorized access to private pages like the Dashboard.
*   **Instant Feedback**: Integrated `react-hot-toast` for real-time user notifications.
*   **Password Reset Flow**: Complete forgot password and reset password pages with email verification.
*   **Type Safety**: Full TypeScript implementation for better developer experience.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Python 3.10+ | Core programming language |
| **Framework** | FastAPI | High-performance async web framework |
| **Frontend** | React (Vite) + TypeScript | Fast, modern frontend with type safety |
| **Database** | SQLite / SQLAlchemy | Relational database management |
| **Security** | PyJWT & Passlib (Bcrypt) | Token handling and password hashing |
| **Email** | Gmail SMTP | Email service for password reset |
| **Styling** | Vanilla CSS + Lucide Icons | Custom glassmorphism styles and modern icons |
| **Animations** | Framer Motion | Smooth UI animations |

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Ram9608/Student-auth-api.git
cd Student-auth-api
```

### 2️⃣ Backend Setup

#### Create Virtual Environment
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

#### Configure Environment Variables
Create a `.env` file in the root directory (see `.env.example` for reference):

```env
# Email Configuration (Gmail SMTP)
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-specific-password

# JWT Secret Key
SECRET_KEY=your-super-secret-key-here
```

> **Note**: For Gmail SMTP, you need to generate an **App Password**. See [EMAIL_SETUP.md](EMAIL_SETUP.md) for detailed instructions.

#### Start the Backend Server
```bash
python -m uvicorn main:app --reload
```
*   The API will start at `http://127.0.0.1:8000`.
*   **Interactive API Docs**: Visit `http://127.0.0.1:8000/docs`.
*   **Alternative Docs**: Visit `http://127.0.0.1:8000/redoc`.

### 3️⃣ Frontend Setup (Optional for Development)
The frontend is already pre-built and served by FastAPI. However, if you want to modify the UI:

```bash
cd react_frontend
npm install
npm run dev
```

To build the frontend for production:
```bash
npm run build
```

---

## 📂 Project Structure

```bash
Student-auth-api/
├── main.py                  # Application entry point & API routes
├── models.py                # Database models (SQLAlchemy)
├── schemas.py               # Pydantic data schemas
├── security.py              # JWT & Hash utilities
├── database.py              # Database connection
├── email_utils.py           # Email sending functionality
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variables template
├── EMAIL_SETUP.md           # Email configuration guide
├── react_frontend/          # React Source Code
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth Context Provider
│   │   ├── pages/           # Login, Register, Dashboard, ForgotPassword, ResetPassword
│   │   ├── api.ts           # Axios instance with interceptors
│   │   └── App.tsx          # Main app with routing
│   ├── dist/                # Production build (served by FastAPI)
│   └── package.json         # Frontend dependencies
└── auth.db                  # Local SQLite Database
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | Create a new student account |
| **POST** | `/api/v1/auth/login` | Login and receive JWT Token |
| **POST** | `/api/v1/auth/forgot-password` | Request password reset email with token |
| **POST** | `/api/v1/auth/reset-password` | Reset password using token from email |
| **GET** | `/api/v1/student/profile` | **[Protected]** Get authenticated user profile |

---

## 📧 Email Configuration

This project uses Gmail SMTP for sending password reset emails. To set it up:

1. **Enable 2-Step Verification** on your Google Account
2. **Generate an App Password** for your application
3. **Add credentials to `.env`** file

For detailed step-by-step instructions, see [EMAIL_SETUP.md](EMAIL_SETUP.md).

---

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using Bcrypt before storage
- **JWT Tokens**: Secure token-based authentication with expiration
- **Token Validation**: Reset tokens expire after 30 minutes
- **Protected Routes**: Backend endpoints protected with JWT verification
- **Environment Variables**: Sensitive data stored in `.env` (not committed to Git)
- **CORS Configuration**: Properly configured for frontend-backend communication

---

## 🎨 Features Walkthrough

### 1. User Registration
- Email and password validation
- Automatic password hashing
- Duplicate email prevention
- JWT token generation on success

### 2. User Login
- Credential verification
- JWT token issuance
- Protected dashboard access

### 3. Forgot Password
- Email-based password reset
- Secure token generation
- Email delivery with reset link
- Token expiration (30 minutes)

### 4. Reset Password
- Token validation
- New password setting
- Automatic token invalidation

### 5. Protected Dashboard
- JWT-based access control
- User profile display
- Secure logout functionality

---

## 🤝 Contribution

Contributions are welcome! If you'd like to improve the UI or add features:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developed by Ram Sahu

A passion project demonstrating modern Authentication flows with FastAPI and React, featuring:
- ✅ JWT-based authentication
- ✅ Email integration for password reset
- ✅ Modern React frontend with TypeScript
- ✅ Production-ready code structure
- ✅ Comprehensive API documentation

```python
print("Happy Coding! 🚀")
```

---

## 🐛 Troubleshooting

**Email not sending?**
- Check your Gmail App Password is correct
- Verify 2-Step Verification is enabled
- See [EMAIL_SETUP.md](EMAIL_SETUP.md) for detailed setup

**Frontend not loading?**
- Ensure backend is running on port 8000
- Check CORS settings in `main.py`
- Verify `dist` folder exists in `react_frontend`

**Database errors?**
- Delete `auth.db` and restart the server to recreate
- Check SQLAlchemy models are properly defined
