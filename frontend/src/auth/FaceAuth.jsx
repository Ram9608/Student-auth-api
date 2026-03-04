import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useAuth } from "../context/AuthContext";
import { Camera, ShieldCheck, UserCheck, AlertCircle, Sparkles, LogIn, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// 🎭 Face Authentication — Phase 11 (Fixed & Connected)
// Flow: Capture → FormData → faceLogin(AuthContext) → JWT stored → /protected/me → navigate

const FaceAuth = () => {
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const { faceLogin } = useAuth();

    // UI State
    const [img, setImg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Camera Ready – Look into the camera");
    const [loginResult, setLoginResult] = useState(null); // 'success' | 'fail' | null
    const [attempts, setAttempts] = useState(0);
    const MAX_ATTEMPTS = 5; // Relaxed for better UX

    const captureAndLogin = async () => {
        if (attempts >= MAX_ATTEMPTS) {
            return toast.error("Max attempts reached. Please use password login.");
        }

        if (!webcamRef.current) {
            return toast.error("Camera not ready. Please allow camera access.");
        }

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc || typeof imageSrc !== 'string') {
            return toast.error("Camera not ready or capture failed.");
        }

        console.debug("📸 AI Vision: Payload Extracted (Length:", imageSrc.length, ")");

        setLoading(true);
        setImg(imageSrc);
        setLoginResult(null);
        setStatus("🔍 AI Mapping (Attempt " + (attempts + 1) + "/" + MAX_ATTEMPTS + ")...");

        try {
            // Directly send base64 to AuthContext -> API
            const res = await faceLogin(imageSrc);

            if (res.success) {
                setLoginResult('success');
                setStatus(`✅ Welcome, ${res.user}!`);
                toast.success(res.message || `Welcome ${res.user}!`);
                setTimeout(() => {
                    navigate(res.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student');
                }, 1200);
            } else {
                setLoginResult('fail');
                setAttempts(prev => prev + 1);
                const errMsg = res.error || "Recognition failed.";
                setStatus(`❌ ${errMsg}`);
                toast.error(errMsg);
            }
        } catch (err) {
            setLoginResult('fail');
            const errMsg = "Connection error. Please try again.";
            setStatus(`❌ ${errMsg}`);
            toast.error(errMsg);
            console.error("FaceAuth error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRetake = () => {
        setImg(null);
        setLoginResult(null);
        setStatus(attempts >= MAX_ATTEMPTS
            ? "❌ Too many failed attempts. Use password login."
            : "Camera Ready – Look into the camera");
    };

    // Status icon
    const StatusIcon = () => {
        if (loginResult === 'success') return <CheckCircle className="w-8 h-8 animate-pulse" />;
        if (loginResult === 'fail') return <XCircle className="w-8 h-8" />;
        return <ShieldCheck className="w-8 h-8 animate-pulse" />;
    };

    const iconBg = loginResult === 'success'
        ? 'bg-emerald-500'
        : loginResult === 'fail'
            ? 'bg-rose-500'
            : 'bg-primary-600';

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <div className="glass w-full max-w-xl p-12 rounded-[4rem] shadow-2xl border-white animate-fade-in flex flex-col items-center relative overflow-hidden">

                {/* Background Blur Orbs */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/10 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary-500/10 blur-3xl rounded-full pointer-events-none" />

                {/* Header */}
                <header className="text-center mb-10 w-full relative">
                    <div className={`p-4 ${iconBg} text-white rounded-2xl shadow-xl w-16 h-16 mx-auto mb-6 flex items-center justify-center transition-all duration-300`}>
                        <StatusIcon />
                    </div>
                    <h2 className="text-3xl font-black font-outfit text-gray-900 tracking-tighter">AI Vision Auth</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 px-4">
                        {status}
                    </p>
                    <Sparkles className="absolute -top-4 right-10 text-secondary-300 w-10 h-10" />
                </header>

                {/* Circular Webcam / Captured Image */}
                <div className={`relative w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden bg-black shadow-2xl group transition-all duration-500
                    ${loginResult === 'success' ? 'border-[8px] border-emerald-400 shadow-emerald-400/30'
                        : loginResult === 'fail' ? 'border-[8px] border-rose-400 shadow-rose-400/20'
                            : 'border-[8px] border-white'}`}>

                    {!img ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            screenshotQuality={0.8}
                            videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
                            className="w-full h-full object-cover"
                            mirrored={true}
                        />
                    ) : (
                        <img src={img} className="w-full h-full object-cover" alt="Captured Face" />
                    )}

                    {/* Scan line animation — only when not captured */}
                    {!img && !loading && (
                        <div className="absolute inset-0 z-10 pointer-events-none">
                            <div className="w-full h-1 bg-primary-500 shadow-[0_0_20px_rgba(37,99,235,0.9)] absolute animate-scan-line" />
                            <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full animate-pulse" />
                        </div>
                    )}

                    {/* Loading overlay */}
                    {loading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-12 flex flex-col w-full gap-4">
                    {loginResult === 'fail' ? (
                        // After failure: show Retake + Try Again buttons
                        <div className="flex gap-3">
                            <button
                                onClick={handleRetake}
                                className="flex-1 flex items-center justify-center gap-2 h-14 bg-gray-100 text-gray-700 font-black text-sm rounded-2xl hover:bg-gray-200 transition-all border border-gray-200"
                            >
                                <RefreshCw className="w-4 h-4" /> Retake
                            </button>
                            <button
                                onClick={captureAndLogin}
                                disabled={loading}
                                className="flex-1 btn-primary h-14 text-sm font-black gap-2 shadow-xl"
                            >
                                <Camera className="w-5 h-5" /> Try Again
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={captureAndLogin}
                            disabled={loading || loginResult === 'success'}
                            className="btn-primary w-full h-16 text-base font-black gap-4 shadow-2xl shadow-primary-500/20 disabled:opacity-60"
                        >
                            {loading
                                ? <span className="flex items-center gap-3">
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    AI Scanning...
                                </span>
                                : loginResult === 'success'
                                    ? <span className="flex items-center gap-3"><CheckCircle className="w-5 h-5" /> Authenticated! Redirecting...</span>
                                    : <><Camera className="w-6 h-6" /> Scan My Face &amp; Login</>
                            }
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center justify-center gap-2 p-4 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-primary-600 transition-all"
                    >
                        <LogIn className="w-4 h-4" /> Traditional Password Login
                    </button>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 flex gap-6 opacity-40">
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest">
                        <UserCheck className="w-3 h-3 text-emerald-500" /> Biometric Sync
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest">
                        <AlertCircle className="w-3 h-3 text-secondary-500" /> Secure Protocol
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceAuth;
