import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, BookOpen, GraduationCap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh', position: 'relative', overflow: 'hidden' }}>

            {/* Background Decorative Elements */}
            <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -50, left: -50, width: 300, height: 300, background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 10, padding: '3rem 2.5rem' }}
            >
                {/* Header Section */}
                <div className="text-center" style={{ marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px', margin: '0 auto 1.5rem',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.2) 100%)',
                        borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(99,102,241,0.1)'
                    }}>
                        <GraduationCap size={32} className="text-primary" />
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Welcome Back</h2>
                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                        Access the <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Education Portal</span>
                        <div style={{ fontSize: '0.8rem', marginTop: '0.4rem', opacity: 0.8 }}>For Students & Instructors</div>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" style={{ marginLeft: '4px' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)', transition: 'color 0.3s' }} size={20} />
                            <input
                                type="email"
                                className="glass-input"
                                style={{ paddingLeft: '48px', height: '52px' }}
                                placeholder="name@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label className="form-label" style={{ marginLeft: '4px' }}>Password</label>
                            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 500 }}>
                                Forgot Password?
                            </Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-secondary)' }} size={20} />
                            <input
                                type="password"
                                className="glass-input"
                                style={{ paddingLeft: '48px', height: '52px' }}
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1.5rem', height: '52px', fontSize: '1.05rem', letterSpacing: '0.3px', borderRadius: '14px' }}
                        disabled={isLoading}
                    >
                        {isLoading ? <div className="spinner"></div> : <>Sign In <LogIn size={20} style={{ marginLeft: '8px' }} /></>}
                    </motion.button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--card-border)' }}>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                        New to the platform?{' '}
                        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, marginLeft: '4px' }}>
                            Create an Account
                        </Link>
                    </p>
                </div>

                {/* Decorative Bottom Icon */}
                <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', opacity: 0.05, transform: 'rotate(-15deg)' }}>
                    <BookOpen size={80} />
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
