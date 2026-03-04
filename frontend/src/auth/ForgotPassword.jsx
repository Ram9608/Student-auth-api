import React, { useState } from "react";
import api from "../api/axios";
import { Mail, ArrowLeft, Send, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// 📩 Forgot Password (Phase 13 Part 3)
// Logic: User input email -> Backend generates reset link -> Mock success notification.

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const sendLink = async (e) => {
        e.preventDefault();
        if (!email) return toast.warning("Email batana zaroori hai! 📧");

        setLoading(true);
        try {
            // Note: Backend endpoint is /auth/forgot-password
            await api.post("/auth/forgot-password", { email });
            toast.success("Reset link sent! Apne inbox (Gmail) me check karein. 📩");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Email nahi mila!");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary-50 to-secondary-50">
            <div className="glass w-full max-w-md p-10 rounded-[3rem] animate-fade-in border-white shadow-2xl relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 p-4 bg-primary-600 rounded-3xl shadow-xl text-white">
                    <Sparkles className="w-10 h-10 animate-pulse" />
                </div>

                <div className="mb-10 text-center pt-4">
                    <h2 className="text-3xl font-black font-outfit text-gray-900 mb-2 uppercase tracking-tighter italic underline decoration-primary-200 decoration-8 underline-offset-4">Forgot Password</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest leading-loose">Humein apna email batayein reset link ke liye.</p>
                </div>

                <form onSubmit={sendLink} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Registered Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="email"
                                required
                                className="input-field pl-12 h-14"
                                placeholder="rahul@example.com"
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full h-14 text-sm font-bold gap-3 shadow-xl shadow-primary-500/10"
                    >
                        {loading ? 'Sending...' : <><Send className="w-5 h-5" /> Send Recovery Link</>}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-gray-100 flex justify-center">
                    <Link to="/login" className="flex items-center gap-2 text-primary-600 font-black text-xs h-10 hover:underline uppercase tracking-widest transition-all hover:scale-105">
                        <ArrowLeft className="w-4 h-4" /> Go Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
