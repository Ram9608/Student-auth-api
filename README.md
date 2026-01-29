# Student Authentication API

A production-ready, high-performance RESTful API built with **FastAPI** designed to handle secure user authentication and management for student platforms. This system implements state-of-the-art security practices including stateless JWT authentication, bcrypt password hashing, and role-based access control.

## 🚀 Key Features

*   **Robust Authentication**: Secure registration and login workflows returning JSON Web Tokens (JWT).
*   **Stateless Security**: Fully stateless architecture using `HS256` signed tokens for scalable deployments.
*   **Role-Based Access Control**: Foundations laid for differentiating between students, admins, and other roles.
*   **Password Management**: Secure password hashing with `bcrypt` and a dedicated Forgot/Reset password flow.
*   **Production Standards**: Built with modern best practices, including input validation (Pydantic), ORM integration (SQLAlchemy), and clean architectural patterns.
*   **Interactive Documentation**: Automatic, interactive API docs generated via Swagger UI and ReDoc.

## 🛠️ Technology Stack

*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework for building APIs.
*   **Database**: SQLite (Development) / Scalable to PostgreSQL (Production) using SQLAlchemy ORM.
*   **Validation**: [Pydantic v2](https://docs.pydantic.dev/) - Data validation and settings management using Python type hints.
*   **Security**:
    *   `Passlib` for Bcrypt password hashing.
    *   `PyJWT` for token generation and decoding.
    *   OAuth2 Password Bearer flow.

## ⚡ Getting Started

### Prerequisites

*   Python 3.9 or higher

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Ram9608/Student-auth-api.git
    cd Student-auth-api
    ```

2.  **Install dependencies**
    It is recommended to use a virtual environment.
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the application**
    ```bash
    uvicorn main:app --reload
    ```
    The server will start at `http://localhost:8000`.

## 📖 API Documentation

Once the server is running, you can access the interactive API specifications:

*   **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs) - Test endpoints directly from your browser.
*   **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc) - Alternative documentation view.

### Core Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new student account. |
| `POST` | `/api/v1/auth/login` | Authenticate and retrieve an access token. |
| `POST` | `/api/v1/auth/forgot-password` | Request a password reset link. |
| `POST` | `/api/v1/auth/reset-password` | Reset password using a valid token. |
| `GET` | `/api/v1/student/profile` | **[Protected]** Retrieve profile of the logged-in student. |

## 🧪 Testing

To test the **Protected Route** in Swagger UI:
1.  Login via `/api/v1/auth/login` to get an `access_token`.
2.  Click the **Authorize** 🔒 button at the top right.
3.  Paste the token value.
4.  Execute the protected endpoints.

## 🤝 Contribution

Contributions are welcome! Please feel free to verify the code and submit a Pull Request.

---

**Developed by Ram Sahu**
