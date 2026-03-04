import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Github, Camera, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../api/axios';

// 🔑 Login Component - Phase 13
// Designed: Clean, Glassmorphism, Premium Gradient.

const StatusIndicator = () => {
    const [status, setStatus] = React.useState('checking');

    React.useEffect(() => {
        const check = async () => {
            try {
                await API.get('/');
                setStatus('online');
            } catch (e) {
                setStatus('offline');
            }
        };
        check();
        const interval = setInterval(check, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status === 'online' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' :
            status === 'checking' ? 'bg-amber-100 text-amber-600 border border-amber-200 animate-pulse' :
                'bg-rose-100 text-rose-600 border border-rose-200'
            }`}>
            <Activity className={`w-3 h-3 ${status === 'online' ? 'animate-pulse' : ''}`} />
            System: {status}
        </div>
    );
};

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const res = await login(credentials.email, credentials.password);

        if (res.success) {
            toast.success("Identity Verified. Redirecting to control center...");
            if (res.role === 'teacher') navigate('/dashboard/teacher');
            else navigate('/dashboard/student');
        } else {
            toast.error(res.error || "Authentication failed. Please verify your credentials.");
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50 font-outfit">
            <div className="mb-6 animate-fade-in">
                <StatusIndicator />
            </div>

            <div className="glass w-full max-w-md p-10 rounded-[3rem] animate-fade-in border-white shadow-[0_20px_50px_rgba(67,56,202,0.15)] relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/5 blur-3xl rounded-full"></div>

                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">CampusDice<span className="text-indigo-600">.ai</span></h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed">AI-Powered Intelligent Assessment & Proctoring</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                type="email"
                                required
                                className="input-field pl-12 h-14 border-gray-100 focus:border-indigo-500"
                                placeholder="name@campus.edu"
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure Password</label>
                            <Link to="/forgot-password" global="true" className="text-[10px] text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-widest">
                                Recovery?
                            </Link>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                type="password"
                                required
                                className="input-field pl-12 h-14 border-gray-100 focus:border-indigo-500"
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full h-16 text-sm font-black shadow-2xl shadow-indigo-500/10 flex items-center justify-center gap-3 relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-indigo-800"
                    >
                        {isLoading ? 'Processing...' : <><LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> Secure Identity Login</>}
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>
                </form>

                <div className="mt-10">
                    <div className="relative flex items-center gap-4 py-2 opacity-50">
                        <div className="flex-1 border-t border-gray-200"></div>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em]">Smart Biometrics</span>
                        <div className="flex-1 border-t border-gray-200"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-6">
                        <button
                            onClick={() => navigate('/face-login')}
                            className="btn-secondary h-16 gap-3 text-[10px] font-black border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center group uppercase tracking-[0.15em] relative shadow-lg"
                        >
                            <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                <Camera className="w-5 h-5" />
                            </div>
                            Biometric Face Authentication
                        </button>
                    </div>
                </div>

                <p className="mt-12 text-center text-gray-400 font-bold uppercase tracking-[0.1em] text-[10px]">
                    New to the portal? <Link to="/signup" className="text-indigo-600 hover:underline">Create Your Account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

// 💡 Developer Note:
// Handled both manual and biometric authentication pathways for security scalability.
// UI status feedback is managed via 'react-toastify' integration.
