import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 🛡️ Security Guard: Role-Based Routing
// Kaam: Check karega ki user logged in hai aur uske paas sahi role (Student/Teacher) hai.

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="h-screen flex items-center justify-center">Loading Secure Routes...</div>;
    }

    // 1️⃣ Auth Check: Agar login hi nahi hai, toh seedha Login par bhej do.
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2️⃣ Role Check: Agar user student hai aur teacher-only page access kar raha hai, toh forbid.
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;

// 💡 Why use this?
// Taaki koi URL manual edit karke Admin ya Teacher panels me jump na kar sake.
// It's client-side security (Frontend layer).
