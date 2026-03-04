import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Briefcase, GraduationCap, ShieldCheck, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../api/axios';

// 📝 Signup Component - Stage 2
// Concept: Role selection (Student/Teacher) with interactive cards.

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

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'student'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await API.post('/auth/signup', formData);
            const faceEnabled = document.getElementById('facelock')?.checked;

            if (faceEnabled) {
                toast.success("Account Initialized! Proceed to login to setup Biometric Identity.");
            } else {
                toast.success("Success! Your account has been created. Please sign in.");
            }
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.detail || "Initialization failed. Support has been notified.");
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50 font-outfit">
            <div className="mb-6 animate-fade-in">
                <StatusIndicator />
            </div>

            <div className="glass w-full max-w-lg p-10 rounded-[3rem] animate-slide-up shadow-[0_20px_50px_rgba(67,56,202,0.15)] border-white relative overflow-hidden">
                {/* Visual Flair */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 blur-3xl rounded-full"></div>

                <div className="mb-10 text-center relative">
                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6">
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Join CampusDice<span className="text-indigo-600">.ai</span></h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed">Secure your credentials for AI-powered assessment precision.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'student' })}
                            className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all duration-500 ${formData.role === 'student' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-500/10' : 'border-gray-50 bg-white text-gray-400 hover:border-gray-100 hover:bg-gray-50'
                                }`}
                        >
                            <GraduationCap className={`w-8 h-8 ${formData.role === 'student' ? 'animate-bounce' : ''}`} />
                            <span className="text-xs font-black uppercase tracking-widest">Student</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'teacher' })}
                            className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all duration-500 ${formData.role === 'teacher' ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-lg shadow-indigo-600/10' : 'border-gray-50 bg-white text-gray-400 hover:border-gray-100 hover:bg-gray-50'
                                }`}
                        >
                            <Briefcase className={`w-8 h-8 ${formData.role === 'teacher' ? 'animate-bounce' : ''}`} />
                            <span className="text-xs font-black uppercase tracking-widest">Instructor</span>
                        </button>
                    </div>

                    <div className="space-y-5 pt-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Organization Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-all" />
                                <input
                                    type="text" required
                                    className="input-field pl-12 h-14 border-gray-100 focus:border-indigo-500"
                                    placeholder="Enter your full name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-all" />
                                <input
                                    type="email" required
                                    className="input-field pl-12 h-14 border-gray-100 focus:border-indigo-500"
                                    placeholder="name@campus.edu"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Passkey</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-all" />
                                <input
                                    type="password" required
                                    className="input-field pl-12 h-14 border-gray-100 focus:border-indigo-500"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* AI Face Lock Security Switch - RGB Enhanced */}
                        <div className="flex items-center gap-4 p-5 bg-indigo-50 rounded-[1.5rem] border border-indigo-100/50 cursor-pointer hover:bg-indigo-100 transition-all group scale-100 active:scale-95 duration-200">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    id="facelock"
                                    className="w-6 h-6 accent-indigo-600 rounded-lg cursor-pointer transition-transform group-hover:scale-110"
                                    defaultChecked
                                />
                            </div>
                            <label htmlFor="facelock" className="flex-1 cursor-pointer">
                                <span className="flex items-center gap-2 text-xs font-black text-indigo-800 uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4" /> Biometric Identity Guard 📸
                                </span>
                                <p className="text-[8px] text-indigo-600 font-bold uppercase tracking-tight mt-0.5 opacity-70 italic">Enhanced security layer using computer vision.</p>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-16 text-base font-black text-white rounded-[1.5rem] transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-indigo-500/20 active:scale-95"
                    >
                        {isLoading ? 'Processing Integration...' : <><UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Initialize Account</>}
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>

                    <p className="pt-6 text-center text-gray-400 font-bold uppercase tracking-[0.1em] text-[10px]">
                        Member of CampusDice? <Link to="/login" className="text-indigo-600 hover:underline transition-colors">Sign In to Control Center</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;

// 💡 UI Logic Note:
// Role selection is dynamic and updates the registration context.
// Selecting the 'Instructor' role triggers subtle theme adaptations for tailored user experience.
