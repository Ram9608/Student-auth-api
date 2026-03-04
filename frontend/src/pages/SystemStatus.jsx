import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { Server, Database, Mail as MailIcon, Cpu, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

const SystemStatus = () => {
    const [status, setStatus] = useState({
        backend: "checking",
        db: "checking",
        smtp: "checking",
        ai: "checking"
    });

    const checkHealth = async () => {
        setStatus({ backend: "checking", db: "checking", smtp: "checking", ai: "checking" });
        try {
            const res = await API.get("/health");
            setStatus({
                backend: res.data.backend || "offline",
                db: res.data.db || "offline",
                smtp: res.data.smtp || "offline",
                ai: res.data.ai || "offline",
            });
        } catch (e) {
            setStatus({ backend: "offline", db: "offline", smtp: "offline", ai: "offline" });
        }
    };

    useEffect(() => {
        checkHealth();
    }, []);

    const StatusCard = ({ title, icon: Icon, state, desc }) => (
        <div className="glass p-8 rounded-3xl border-white shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${state === 'online' || state === 'configured' ? 'bg-emerald-50 text-emerald-600' :
                    state === 'checking' ? 'bg-amber-50 text-amber-600 animate-pulse' :
                        'bg-rose-50 text-rose-600'
                    }`}>
                    <Icon className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{title}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{desc}</p>
                </div>
            </div>

            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${state === 'online' || state === 'configured' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                state === 'checking' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' :
                    'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                }`}>
                {state === 'online' || state === 'configured' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {state}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar role="student" />

            <main className="max-w-4xl mx-auto p-10 pt-20">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-black font-outfit text-gray-900 tracking-tighter">System Diagnostic</h2>
                        <p className="text-gray-500 italic font-medium">Monitoring cross-stack connectivity and AI logic integrity.</p>
                    </div>
                    <button
                        onClick={checkHealth}
                        className="p-4 bg-primary-600 text-white rounded-2xl shadow-2xl hover:bg-primary-700 active:scale-95 transition-all"
                    >
                        <RefreshCw className="w-6 h-6" />
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <StatusCard
                        title="Backend Engine"
                        icon={Server}
                        state={status.backend}
                        desc="FastAPI / Uvicorn (Port 8000)"
                    />
                    <StatusCard
                        title="PostgreSQL"
                        icon={Database}
                        state={status.db}
                        desc="DB Health & Migration Sync"
                    />
                    <StatusCard
                        title="SMTP Mailer"
                        icon={MailIcon}
                        state={status.smtp}
                        desc="Gmail App-Pass Configuration"
                    />
                    <StatusCard
                        title="Groq AI / Vision"
                        icon={Cpu}
                        state={status.ai}
                        desc="LLM & OpenCV Proctored Core"
                    />
                </div>

                <div className="mt-12 p-10 glass rounded-[3rem] border-white shadow-2xl text-center">
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic mb-4">Diagnostic Log:</p>
                    <div className="bg-gray-900/5 p-6 rounded-2xl text-[11px] font-mono text-gray-600 text-left overflow-x-auto">
                        [DEBUG] ENV_LOAD: SUCCESS <br />
                        [DEBUG] PORT_8000: LISTENING (127.0.0.1) <br />
                        [DEBUG] DB_CONN_STRING: postgresql://postgres:***@127.0.0.1:5432 <br />
                        [DEBUG] CORS_ORIGINS: * (Bypass mode active)
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SystemStatus;
