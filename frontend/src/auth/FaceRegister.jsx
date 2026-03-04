import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import api from "../api/axios";
import { Camera, ShieldCheck, UserPlus, AlertCircle, Sparkles, ArrowRight, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Face Registration Component - Circular RGB Webcam with AI Facelock Registration

const FaceRegister = () => {
    const webcamRef = useRef(null);
    const [img, setImg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [status, setStatus] = useState("Align your face inside the circle");
    const navigate = useNavigate();
    const { user } = useAuth();

    // High-Performance Face Capture Settings
    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: "user"
    };

    const captureAndRegister = useCallback(async () => {
        if (!webcamRef.current) return;

        // Capture with optimized resolution for AI Logic
        const imageSrc = webcamRef.current.getScreenshot({ width: 640, height: 480 });
        if (!imageSrc) return toast.error("Camera permissions required.");

        setLoading(true);
        setImg(imageSrc);
        setStatus("🧬 Mapping Face Biometrics (Please stay still)...");

        try {
            const fetchResponse = await fetch(imageSrc);
            const blob = await fetchResponse.blob();

            const formData = new FormData();
            formData.append("file", blob, "face_reg_optimized.jpg");

            await api.post("/vision/register-face", formData, {
                timeout: 120000 // Extended for model load
            });

            setRegistered(true);
            setStatus("🛡️ AI Facelock Active!");
            toast.success("Facelock Registration Successful! redirecting...");

            setTimeout(() => {
                const target = user?.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student';
                navigate(target);
            }, 2500);

        } catch (err) {
            console.error("Full Error Object:", err);
            const errorMsg = err.response?.data?.detail
                || (err.code === "ECONNABORTED" ? "AI Server Timeout: Model takes too long to load." :
                    err.message === "Network Error" ? `Network Failed: Backend at ${api.defaults.baseURL} unreachable. Check CORS/Backend logs.` : err.message)
                || "Registration failed. Try again with better lighting.";

            toast.error(`❌ ${errorMsg}`);
            setImg(null);
            setStatus("Wait for next capture attempt...");
        }
        setLoading(false);
    }, [navigate, user]);

    const retake = () => {
        setImg(null);
        setStatus("Align your face inside the circle");
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
            <div className="glass w-full max-w-2xl p-12 rounded-[4rem] shadow-2xl border-white animate-fade-in flex flex-col items-center relative overflow-hidden">

                {/* Visual Flair */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/10 blur-3xl rounded-full"></div>

                {/* Header */}
                <header className="text-center mb-10 w-full relative">
                    <div className={`p-4 text-white rounded-2xl shadow-xl w-16 h-16 mx-auto mb-6 flex items-center justify-center transition-all ${registered ? 'bg-emerald-500' : 'bg-emerald-600'}`}>
                        {registered ? <CheckCircle className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
                    </div>
                    <h2 className="text-3xl font-black font-outfit text-gray-900 tracking-tighter">Setup AI Facelock</h2>
                    {user && <p className="text-xs text-emerald-600 font-bold mt-1">{user.full_name}</p>}
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic underline decoration-emerald-200 underline-offset-4 decoration-4">
                        {status}
                    </p>
                    <Sparkles className="absolute -top-4 right-10 text-emerald-300 w-10 h-10 animate-pulse" />
                </header>

                {/* Circular RGB Webcam Container */}
                <div className={`relative w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden bg-black border-[8px] shadow-2xl group transition-all ${registered ? 'border-emerald-400 shadow-emerald-400/30' : 'border-white'}`}>
                    {!img ? (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            screenshotQuality={0.95}
                            videoConstraints={videoConstraints}
                            mirrored={true}
                            className="w-full h-full object-cover"
                            style={{ filter: 'none' }}  // Ensure RGB, no grayscale
                        />
                    ) : (
                        <img src={img} className="w-full h-full object-cover" alt="Captured Frame" />
                    )}

                    {/* Circular Scanning Animation Overlay */}
                    {!registered && (
                        <div className="absolute inset-0 z-10 pointer-events-none">
                            <div className="w-full h-[2px] bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,1)] absolute animate-scan-line opacity-90"></div>
                            <div className="absolute inset-4 border-2 border-dashed border-emerald-400/40 rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
                            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-pulse"></div>
                        </div>
                    )}

                    {/* Success Overlay */}
                    {registered && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center z-20">
                            <CheckCircle className="w-20 h-20 text-emerald-500 drop-shadow-xl" />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-12 flex flex-col w-full gap-4">
                    {img && !loading && !registered ? (
                        <div className="flex gap-4">
                            <button
                                onClick={retake}
                                className="flex-1 flex items-center justify-center gap-2 h-14 bg-gray-100 text-gray-600 font-black text-sm rounded-2xl hover:bg-gray-200 transition-all border border-gray-200"
                            >
                                <RefreshCw className="w-5 h-5" /> Retake
                            </button>
                            <button
                                onClick={captureAndRegister}
                                className="flex-1 h-14 btn-primary text-sm font-black gap-3 shadow-xl shadow-emerald-500/20 bg-gradient-to-r from-emerald-600 to-teal-600 border-none"
                            >
                                Save & Register 🛡️
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={captureAndRegister}
                            disabled={loading || registered}
                            className="btn-primary w-full h-16 text-base font-black gap-4 shadow-2xl shadow-emerald-500/30 bg-gradient-to-r from-emerald-600 to-teal-600 border-none group disabled:opacity-60"
                        >
                            {loading ? (
                                <span className="flex items-center gap-3">
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    AI Mapping Face Biometrics...
                                </span>
                            ) : registered ? (
                                <span className="flex items-center gap-3"><CheckCircle className="w-6 h-6" /> Registered! Redirecting...</span>
                            ) : (
                                <span className="flex items-center gap-3"><Camera className="w-6 h-6 group-hover:rotate-12 transition-transform" /> Capture & Register Face</span>
                            )}
                        </button>
                    )}

                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 p-4 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-emerald-600 transition-all"
                    >
                        Maybe Later <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 flex gap-6 opacity-40">
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest"><ShieldCheck className="w-3 h-3 text-emerald-500" /> AES-256 Encrypted</div>
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest"><AlertCircle className="w-3 h-3 text-amber-500" /> RGB Biometric Logic</div>
                </div>
            </div>
        </div>
    );
};

export default FaceRegister;
