import axios from 'axios';

// 📡 Backend Core Configuration
// BaseURL points to our FastAPI server.
// Credentials = True to handle Cookies/CORS correctly if needed.

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    withCredentials: false,
});

// ⚡ Request Interceptor: Auto-attach JWT Token
// Har baar token manually attachment ki zarurat nahi.
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // FastAPI OAuth2 format
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ⚡ Response Interceptor: Global Error Handling
// Expired tokens or Server 500 signals central management.
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Automatic Logout on Token Expiry
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;

// 💡 Pro-Tip: Axios intercepts simplify the developer DX.
// Clean UI code as we don't have to check 401 on every single page.
