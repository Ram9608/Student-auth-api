import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (!tokenFromUrl) {
            toast.error('Invalid reset link');
            navigate('/login');
        } else {
            setToken(tokenFromUrl);
        }
    }, [searchParams, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/reset-password', {
                token: token,
                new_password: password
            });
            toast.success('Password reset successfully! Please login.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to reset password. Token may be expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{ width: '100%', maxWidth: '450px' }}
            >
                <div className="text-center" style={{ marginBottom: '2rem' }}>
                    <h2>Reset Password</h2>
                    <p>Enter your new password</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-secondary)' }} size={20} />
                            <input
                                type="password"
                                className="glass-input"
                                style={{ paddingLeft: '45px' }}
                                placeholder="Min 8 characters"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-secondary)' }} size={20} />
                            <input
                                type="password"
                                className="glass-input"
                                style={{ paddingLeft: '45px' }}
                                placeholder="Re-enter password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : 'Reset Password'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem' }}>
                        Remember your password? <a href="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sign In</a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
