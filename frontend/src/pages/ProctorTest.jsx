import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { useAuth } from "../context/AuthContext";
import {
    ShieldAlert, AlertTriangle, CheckCircle, Timer,
    Camera, Smartphone, Users, Eye, XCircle, Info, User, FileText
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

// 🛡️ AI Proctoring System - CampusDice.ai
// Flow: Live Stream -> WebSocket (/proctor) -> Real-time Monitoring -> Security Logging

const ProctorTest = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const ws = useRef(null);

    const [alerts, setAlerts] = useState([]);
    const [status, setStatus] = useState("SECURE"); // SECURE | VIOLATION | REVOKED
    const [warningCount, setWarningCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(3600);
    const [isConnected, setIsConnected] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [currentViolation, setCurrentViolation] = useState("");

    const testData = location.state || { id: 0, title: "Assessment", questions: [], duration: 30 };
    const questions = testData.questions && testData.questions.length > 0 ? testData.questions : [
        { q: "Loading Question...", options: ["A", "B", "C", "D"], correct: 0 }
    ];

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState(new Array(questions.length).fill(null));

    // 🛡️ SECURITY Logic
    useEffect(() => {
        const preventDefault = (e) => e.preventDefault();
        document.addEventListener("contextmenu", preventDefault);
        document.addEventListener("copy", preventDefault);
        document.addEventListener("paste", preventDefault);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setWarningCount(prev => prev + 1);
                setCurrentViolation("TAB SWITCH DETECTED");
                setShowWarning(true);
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = "Assessment session in progress. Unauthorized exit will result in immediate submission.";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            document.removeEventListener("contextmenu", preventDefault);
            document.removeEventListener("copy", preventDefault);
            document.removeEventListener("paste", preventDefault);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    // Auto-Submit after 3 Warnings
    useEffect(() => {
        if (warningCount >= 3 && !isSubmitted) {
            setStatus("REVOKED");
            toast.error("Security Violation: Assessment Revoked.");
            setTimeout(() => submitTest(true), 1500);
        }
    }, [warningCount, isSubmitted]);

    // WebSocket Logic
    useEffect(() => {
        const socketUrl = `ws://127.0.0.1:8000/vision/proctor`;
        ws.current = new WebSocket(socketUrl);

        ws.current.onopen = () => {
            setIsConnected(true);
            toast.success("AI Monitoring Active & Secured. 🛡️");
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.status === "REVOKED") {
                setStatus("REVOKED");
                submitTest(true);
            } else if (data.alerts?.length > 0) {
                // Warning count increment handled by backend mostly, but we sync here
                setWarningCount(data.warning_count);
                setAlerts(data.alerts);
                setStatus("VIOLATION");
                setCurrentViolation(data.alerts[0]);
                setShowWarning(true);
            } else {
                setStatus("SECURE");
                setAlerts([]);
            }
        };

        ws.current.onclose = () => setIsConnected(false);
        return () => ws.current?.close();
    }, []);

    // Frame Capture Loop
    const captureFrame = useCallback(() => {
        if (webcamRef.current && ws.current?.readyState === WebSocket.OPEN) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) ws.current.send(imageSrc);
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(captureFrame, 1000);
        return () => clearInterval(interval);
    }, [captureFrame]);

    // Timer Hook
    useEffect(() => {
        if (timeLeft <= 0 && !isSubmitted) {
            submitTest();
            return;
        }
        const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isSubmitted]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const submitTest = async (revoked = false) => {
        if (isSubmitted) return;
        setIsSubmitted(true);
        let score = 0;
        if (!revoked) {
            questions.forEach((q, idx) => {
                if (answers[idx] === q.correct) score += 10; // 10 Marks per question
            });
        }
        try {
            console.log("Submitting Test Payload:", { test_id: testData.id, score, warnings_count: warningCount });
            await api.post('/student/submit-test', {
                test_id: testData.id,
                score: revoked ? 0 : score,
                warnings_count: warningCount
            });
            toast.success(revoked ? "Test Revoked ❌" : "Test Submitted! ✅");
            if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
            navigate('/dashboard/student');
        } catch (err) {
            toast.error("Submission failed.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-outfit p-6 overflow-hidden">

            {/* Header: Test Info & Timer */}
            <header className="flex items-center justify-between mb-8 px-8 bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">{testData.title}</h1>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                            <Info className="w-3.5 h-3.5" /> AI-Monitored Assessment Session
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className={`px-6 py-3 rounded-2xl border font-black text-xl flex items-center gap-3 transition-all duration-500 ${timeLeft < 300 ? 'bg-rose-500/20 border-rose-500 text-rose-500 animate-pulse' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-100 shadow-inner'}`}>
                        <Timer className="w-6 h-6 text-indigo-400" /> {formatTime(timeLeft)}
                    </div>
                    <button onClick={() => submitTest()} className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                        Finalize Assessment
                    </button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">

                {/* Left: Question Area (The actual test portal) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-slate-900/40 rounded-[3rem] border border-white/5 p-10 flex-1 flex flex-col backdrop-blur-md relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FileText className="w-64 h-64 -rotate-12" />
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-500/30">
                                Question {currentQuestion + 1} of {questions.length}
                            </span>
                            <div className="flex gap-2">
                                {questions.map((_, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${currentQuestion === i ? 'bg-indigo-500 scale-150 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : answers[i] !== null ? 'bg-emerald-500' : 'bg-white/10'}`} />
                                ))}
                            </div>
                        </div>

                        <h2 className="text-3xl font-black mb-12 leading-tight max-w-2xl text-slate-100">{questions[currentQuestion].q}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {questions[currentQuestion].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setAnswers(prev => {
                                        const next = [...prev];
                                        next[currentQuestion] = idx;
                                        return next;
                                    })}
                                    className={`p-6 rounded-2xl border transition-all duration-300 group flex items-center justify-between ${answers[currentQuestion] === idx ? 'bg-indigo-600/20 border-indigo-500/50 scale-[1.01] shadow-xl' : 'bg-slate-800/20 border-white/5 hover:border-white/20 hover:bg-slate-800/40'}`}
                                >
                                    <span className="font-bold flex items-center gap-4">
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${answers[currentQuestion] === idx ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-400'}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className={answers[currentQuestion] === idx ? 'text-white' : 'text-slate-300'}>{option}</span>
                                    </span>
                                    {answers[currentQuestion] === idx && <CheckCircle className="w-5 h-5 text-indigo-400" />}
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto pt-10 flex items-center justify-between gap-6">
                            <button
                                disabled={currentQuestion === 0}
                                onClick={() => setCurrentQuestion(p => p - 1)}
                                className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-20 transition-all active:scale-95 border border-white/5"
                            >
                                Back
                            </button>
                            {currentQuestion === questions.length - 1 ? (
                                <button onClick={() => submitTest()} className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all active:scale-95 text-white">
                                    Conclude Session
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentQuestion(p => p + 1)}
                                    className="px-12 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 text-white"
                                >
                                    Continue
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-indigo-500/5 p-6 rounded-[2rem] border border-indigo-500/10 italic text-[10px] font-bold text-indigo-300 flex items-center gap-3 tracking-widest uppercase">
                        <AlertTriangle className="w-5 h-5 text-indigo-500 shrink-0" />
                        AI Biometric Tracking Enabled: Maintain full focus and visibility.
                    </div>
                </div>

                {/* Right: Monitoring & Logs */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
                    {/* Camera Feed Container */}
                    <div className={`relative h-64 rounded-[2.5rem] overflow-hidden border-[6px] shadow-2xl transition-all duration-500 ${status === 'REVOKED' ? 'border-red-600 grayscale' : status === 'VIOLATION' ? 'border-rose-500 shadow-rose-500/20' : 'border-emerald-500 shadow-emerald-500/20'}`}>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover"
                            mirrored={true}
                        />

                        {/* Status Overlays */}
                        <div className="absolute top-4 left-4">
                            <div className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 backdrop-blur-xl border ${warningCount >= 2 ? 'bg-red-500/80 border-red-400 animate-pulse' : 'bg-black/60 border-white/10'}`}>
                                Warnings: {warningCount} / 3
                            </div>
                        </div>

                        <div className="absolute top-4 right-4">
                            <div className={`px-3 py-1.5 rounded-full font-black text-[8px] uppercase tracking-widest flex items-center gap-2 backdrop-blur-md ${status === 'SECURE' ? 'bg-emerald-500/80' : 'bg-rose-500/80'}`}>
                                {status}
                            </div>
                        </div>

                        {/* Revoked Overlay */}
                        {status === 'REVOKED' && (
                            <div className="absolute inset-0 bg-red-600/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6 z-50">
                                <XCircle className="w-12 h-12 text-white mb-2" />
                                <h2 className="text-xl font-black text-white uppercase">Access Revoked</h2>
                            </div>
                        )}

                        {/* Scanning Effect */}
                        <div className="absolute inset-0 pointer-events-none opacity-30">
                            <div className="w-full h-0.5 bg-indigo-400 absolute animate-scan-line" />
                        </div>
                    </div>

                    {/* Proctored Log Panel */}
                    <div className="flex-1 bg-slate-800/50 rounded-[2.5rem] border border-white/10 flex flex-col p-8 backdrop-blur-xl overflow-hidden">
                        <h3 className="text-sm font-black mb-6 uppercase tracking-widest text-gray-300 flex items-center gap-3">
                            <ShieldAlert className="w-4 h-4 text-indigo-400" /> Security Logs
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {alerts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-10">
                                    <Users className="w-12 h-12 mb-4" />
                                    <p className="font-bold text-[10px] uppercase">Stable Connection</p>
                                </div>
                            ) : alerts.map((alert, idx) => (
                                <div key={idx} className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-start gap-3 animate-slide-up">
                                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-black text-rose-200 uppercase leading-tight">{alert}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                            <MetricRow label="Face Sync" icon={User} active={status === 'SECURE'} />
                            <MetricRow label="Object Filter" icon={Smartphone} active={!alerts.some(a => a.includes('OBJECT'))} danger={alerts.some(a => a.includes('OBJECT'))} />
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Warning Modal */}
            {showWarning && status !== 'REVOKED' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
                    <div className="bg-slate-900 border-2 border-rose-500 rounded-[3rem] p-10 max-w-lg w-full shadow-[0_0_50px_rgba(244,63,94,0.3)] animate-bounce-in text-center">
                        <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/40">
                            <AlertTriangle className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">AI Security Warning</h2>
                        <p className="text-rose-400 font-bold mb-6 text-sm uppercase tracking-widest">{currentViolation}</p>

                        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                You have received <strong className="text-white text-xl">{warningCount} / 3</strong> warnings.
                                <br />
                                <span className="text-xs mt-2 block">If you reach 3 warnings, your test will be <strong>revoked and submitted with 0 marks</strong>.</span>
                            </p>
                        </div>

                        <button
                            onClick={() => setShowWarning(false)}
                            className="w-full py-4 bg-rose-500 hover:bg-rose-600 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-rose-500/20 active:scale-95 transition-all"
                        >
                            I Understand & Return to Test
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const MetricRow = ({ label, icon: Icon, active, danger }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
            <Icon className="w-4 h-4" /> {label}
        </div>
        <div className={`w-2 h-2 rounded-full ${danger ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`} />
    </div>
);

const GraduationCap = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
);

export default ProctorTest;
