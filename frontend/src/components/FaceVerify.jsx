import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import api from "../api/axios";
import { Camera, ShieldCheck, UserCheck, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const FaceVerify = ({ onVerified }) => {
    const webcamRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Keep face centered");
    const { user } = useAuth();
    const [img, setImg] = useState(null);

    const verify = useCallback(async () => {
        if (!webcamRef.current) return;

        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        setLoading(true);
        setImg(imageSrc);
        setStatus("Verifying Identity...");

        try {
            const fetchResponse = await fetch(imageSrc);
            const blob = await fetchResponse.blob();

            const formData = new FormData();
            formData.append("file", blob, "verify.jpg");

            // RBAC Path Selection
            const path = user?.role === 'teacher' ? '/vision/teacher/facelock' : '/vision/student/facelock';

            const res = await api.post(path, formData);

            toast.success(res.data.message);
            if (onVerified) onVerified();
        } catch (err) {
            const errorMsg = err.response?.data?.detail || "Verification failed";
            toast.error(errorMsg);
            setImg(null);
        } finally {
            setLoading(false);
            setStatus("Wait for next check...");
        }
    }, [user, onVerified]);

    return (
        <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-600" /> Biometric Identity Guard
            </h4>

            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary-500/20 shadow-inner">
                {!img ? (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ width: 400, height: 400, facingMode: "user" }}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <img src={img} className="w-full h-full object-cover" alt="Verification" />
                )}
                <div className="absolute inset-0 border-2 border-primary-500/10 rounded-full animate-pulse"></div>
            </div>

            <p className="text-[10px] font-bold text-gray-400 uppercase">{status}</p>

            <button
                onClick={verify}
                disabled={loading}
                className="btn-primary w-full py-3 text-xs font-black gap-2 transition-all active:scale-95"
            >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                Verify My Identity
            </button>
        </div>
    );
};

export default FaceVerify;
