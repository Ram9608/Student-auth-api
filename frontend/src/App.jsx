import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// 🔐 Pages & Components (Static Imports for reliability)
import Login from './auth/Login';
import Signup from './auth/Signup';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import FaceAuth from './auth/FaceAuth';
import FaceRegister from './auth/FaceRegister';
import StudentDashboard from './dashboard/StudentDashboard';
import TeacherDashboard from './dashboard/TeacherDashboard';
import JobList from './student/JobList';
import ResumeUpload from './student/ResumeUpload';
import Analyzer from './student/Analyzer';
import Chatbot from './student/Chatbot';
import PostJob from './teacher/PostJob';
import Applications from './teacher/Applications';
import SystemStatus from './pages/SystemStatus';
import NotFound from './pages/NotFound';
import ProctorTest from './pages/ProctorTest';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-10 text-center font-outfit">
                    <h1 className="text-3xl font-black text-rose-600 mb-6 uppercase tracking-tighter">System Alert ⚠️</h1>
                    <div className="w-full max-w-2xl bg-white p-8 rounded-[2rem] shadow-2xl border border-rose-100 text-left overflow-hidden">
                        <p className="text-rose-500 font-black uppercase text-[10px] tracking-widest mb-2 px-1">Integrity Signature</p>
                        <pre className="p-5 bg-rose-50/50 rounded-2xl text-xs text-rose-800 font-mono overflow-auto max-h-[300px] border border-rose-100/50">
                            {this.state.error?.toString() || "Unknown session interruption"}
                        </pre>
                        {this.state.error?.stack && (
                            <div className="mt-6">
                                <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-2 px-1">Diagnostic Log</p>
                                <pre className="p-5 bg-gray-50 rounded-2xl text-[9px] text-gray-500 font-mono overflow-auto max-h-[200px] border border-gray-100">
                                    {this.state.error.stack}
                                </pre>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-10 px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        Re-initialize Session
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ✨ Loading Component
const PageLoader = () => (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white font-outfit">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-xl"></div>
        <p className="mt-6 text-indigo-900 font-black uppercase tracking-widest text-[10px]">CampusDice.ai &mdash; Initializing Infrastructure</p>
    </div>
);

const App = () => {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <div className="font-inter bg-slate-50 selection:bg-indigo-100 selection:text-indigo-700">
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                {/* 🔓 Public Routes (Login/Signup) */}
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />
                                <Route path="/face-login" element={<FaceAuth />} />
                                <Route path="/face-register" element={<ProtectedRoute><FaceRegister /></ProtectedRoute>} />
                                <Route path="/test/proctored/:appId" element={<ProtectedRoute allowedRoles={['student']}><ProctorTest /></ProtectedRoute>} />

                                {/* 🎓 Student Restricted Routes (Protected) */}
                                <Route
                                    path="/dashboard/student"
                                    element={
                                        <ProtectedRoute allowedRoles={['student']}>
                                            <StudentDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/jobs"
                                    element={
                                        <ProtectedRoute allowedRoles={['student']}>
                                            <JobList />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/resume-analyzer"
                                    element={
                                        <ProtectedRoute allowedRoles={['student']}>
                                            <Analyzer />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/ai-chatbot"
                                    element={
                                        <ProtectedRoute allowedRoles={['student']}>
                                            <Chatbot />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* 👨‍🏫 Teacher Restricted Routes (Secret Area) */}
                                <Route
                                    path="/dashboard/teacher"
                                    element={
                                        <ProtectedRoute allowedRoles={['teacher']}>
                                            <TeacherDashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/jobs/manage"
                                    element={
                                        <ProtectedRoute allowedRoles={['teacher']}>
                                            <div className="flex bg-gray-50 min-h-screen">
                                                <TeacherDashboard />
                                            </div>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/applications"
                                    element={
                                        <ProtectedRoute allowedRoles={['teacher']}>
                                            <div className="flex bg-gray-50 min-h-screen">
                                                <Sidebar />
                                                <main className="flex-1">
                                                    <Navbar role="teacher" />
                                                    <div className="p-10">
                                                        <Applications />
                                                    </div>
                                                </main>
                                            </div>
                                        </ProtectedRoute>
                                    }
                                />

                                {/* 🧭 Common Redirects & Dashboard Shortcuts */}
                                <Route path="/system-status" element={<SystemStatus />} />
                                <Route path="/signin" element={<Navigate to="/login" replace />} />
                                <Route path="/recommendations" element={<ProtectedRoute allowedRoles={['student']}><Navigate to="/dashboard/student" replace /></ProtectedRoute>} />
                                <Route path="/" element={<Navigate to="/login" replace />} />

                                {/* 🚫 Errors Handling */}
                                <Route path="/unauthorized" element={<div className="h-screen flex items-center justify-center text-rose-500 font-black uppercase tracking-[0.2em] glass text-[10px]">Access Denied: Forbidden Path 🚫</div>} />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </Suspense>
                    </div>
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
};

export default App;

