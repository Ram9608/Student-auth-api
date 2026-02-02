import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Phone, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'student'
    });
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.id || e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(formData);
            toast.success('Account created! Please login.');
            navigate('/login');
        } catch (error: any) {
            let errorMessage = 'Registration failed';

            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                if (Array.isArray(detail)) {
                    // Extract messages from Pydantic validation errors
                    errorMessage = detail.map((err: any) => err.msg).join(', ');
                } else {
                    errorMessage = detail;
                }
            }

            toast.error(errorMessage);
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
                style={{ width: '100%', maxWidth: '550px' }}
            >
                <div className="text-center" style={{ marginBottom: '2rem' }}>
                    <h2>Create Account</h2>
                    <p>Join the community today</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input type="text" id="first_name" className="glass-input" placeholder="John" required onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input type="text" id="last_name" className="glass-input" placeholder="Doe" required onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-secondary)' }} size={20} />
                            <input type="email" id="email" className="glass-input" style={{ paddingLeft: '45px' }} placeholder="name@university.edu" required onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">I am a</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="glass-input"
                            style={{ width: '100%', padding: '12px 1rem' }}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <div style={{ position: 'relative' }}>
                            <Phone style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-secondary)' }} size={20} />
                            <input type="tel" id="phone" className="glass-input" style={{ paddingLeft: '45px' }} placeholder="+1 234 567 890" required onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-secondary)' }} size={20} />
                            <input type="password" id="password" className="glass-input" style={{ paddingLeft: '45px' }} placeholder="Min 8 characters" required onChange={handleChange} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : <>Create Account <UserPlus size={20} /></>}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sign In</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
