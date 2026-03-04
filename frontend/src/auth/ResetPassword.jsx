import React, { useState } from "react";
import api from "../api/axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

// 🔑 Reset Password (Phase 13 Part 3)
// Logic: Extract token from URL -> Input new password -> API call to FastAPI.

const ResetPassword = () => {
    const { token } = useParams(); // URL se token extract
    const navigate = useNavigate();
    const [pass, setPass] = useState("");
    const [loading, setLoading] = useState(false);

    const reset = async (e) => {
        e.preventDefault();
        if (!pass) return toast.warning("Naya password batayein! 🔑");

        setLoading(true);
        try {
            // Note: Backend endpoint is /auth/reset-password/{token}
            await api.post(`/auth/reset-password/${token}`, { password: pass });
            toast.success("Password Updated! Ab login kijiye. ✅");
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Link invalid hai!");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary-50 to-secondary-50">
            <div className="glass w-full max-w-md p-10 rounded-[3rem] animate-slide-up border-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 blur-[80px] rounded-full group-hover:bg-primary-300 transition-colors"></div>

                <div className="mb-10 text-center relative z-10">
                    <h2 className="text-3xl font-black font-outfit text-gray-900 mb-2 uppercase tracking-tighter italic">Set New Password</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest leading-loose">Puraani bhool jao, naya set karke platform par aao.</p>
                </div>

                <form onSubmit={reset} className="space-y-8 relative z-10">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Secure Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="input-field pl-12 h-14"
                                    placeholder="••••••••"
                                    onChange={e => setPass(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="input-field pl-12 h-14"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full h-14 text-sm font-bold gap-3 shadow-xl shadow-primary-500/10 active:scale-95"
                    >
                        {loading ? 'Processing...' : <><Sparkles className="w-5 h-5" /> Update My Credentials</>}
                    </button>

                    <p className="mt-8 text-center text-gray-600">
                        Wapas Login par? <Link to="/login" className="text-secondary-600 font-bold hover:underline transition-all">Abhi Chalein</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
