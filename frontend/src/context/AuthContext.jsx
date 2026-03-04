import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

// 🛡️ Global Auth Context
// Kaam: User state (Login/Logout/Role) ko puri app me accessible banata hai.

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check login status on page refresh
    useEffect(() => {
        const syncUser = () => {
            try {
                const savedUser = localStorage.getItem('user');
                const token = localStorage.getItem('token');
                if (savedUser && token) {
                    const parsed = JSON.parse(savedUser);
                    // 🔄 Compatibility Patch: name <-> full_name
                    if (parsed.name && !parsed.full_name) parsed.full_name = parsed.name;
                    setUser(parsed);
                }
            } catch (err) {
                console.error("AuthContext Sync Error:", err);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };
        syncUser();
    }, []);

    // Helper logic to ensure errors are always readable strings
    const getError = (err) => {
        const data = err.response?.data;
        if (!data) return "Network Error: Server unreachable";

        // Handle FastAPI 422 Validation Error (Array of Objects)
        if (Array.isArray(data.detail)) {
            return data.detail[0]?.msg || "Validation Error";
        }

        // Handle Custom Detail String or Message
        return data.detail || data.message || "An unexpected error occurred";
    };

    const login = async (email, password) => {
        try {
            const { data } = await API.post('/auth/login', { email, password });
            localStorage.setItem('token', data.access_token);
            const profile = await API.get('/protected/me');
            setUser(profile.data);
            localStorage.setItem('user', JSON.stringify(profile.data));
            return { success: true, role: profile.data.role };
        } catch (err) {
            return { success: false, error: getError(err) };
        }
    };

    const faceLogin = async (base64Image) => {
        try {
            const { data } = await API.post('/vision/face-login', { image: base64Image }, {
                timeout: 120000
            });

            if (data.verified) {
                localStorage.setItem('token', data.access_token);
                const profile = await API.get('/protected/me');
                setUser(profile.data);
                localStorage.setItem('user', JSON.stringify(profile.data));
                return { success: true, user: data.user, role: data.role, message: data.message };
            } else {
                return { success: false, error: data.message || 'Face recognition failed.' };
            }
        } catch (err) {
            console.error('FaceLogin error:', err.response?.data || err.message);
            return { success: false, error: getError(err) };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, faceLogin, logout, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

// 💡 Suggested Logic:
// 'Role-based access control (RBAC)' is very easy here.
// Simply check if user.role matches the needed role for a feature.
