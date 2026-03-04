import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { CheckCircle, AlertCircle, Clock, FileText, Bot } from "lucide-react";

// 📊 Application Status (Phase 13 Part 2)
// This displays the current student's application history and their statuses.

const ApplicationStatus = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch current student's applications
        const fetchApps = async () => {
            try {
                // Note: Backend endpoint is /jobs/applications/my
                const res = await api.get("/jobs/applications/my");
                setApps(res.data);
            } catch (e) {
                console.error("Applications load fail", e);
            }
            setLoading(false);
        };
        fetchApps();
    }, []);

    const StatusBadge = ({ status }) => {
        const styles = {
            applied: "bg-blue-50 text-blue-600 border-blue-100",
            reviewing: "bg-amber-50 text-amber-600 border-amber-100",
            accepted: "bg-emerald-50 text-emerald-600 border-emerald-100",
            rejected: "bg-rose-50 text-rose-600 border-rose-100"
        };
        const currentStyle = styles[status] || styles.applied;

        return (
            <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${currentStyle} tracking-widest`}>
                {status}
            </span>
        );
    };

    return (
        <div className="glass p-10 rounded-[3rem] shadow-xl animate-fade-in border-white flex flex-col h-full">
            <h2 className="text-2xl font-bold font-outfit text-gray-900 mb-8 flex items-center gap-3">
                <CheckCircle className="text-secondary-600" /> My Applications Status
            </h2>

            {loading ? (
                <div className="flex justify-center p-20 text-secondary-600 font-bold text-xl animate-pulse">
                    Tracking status...
                </div>
            ) : (
                <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
                    {apps.length > 0 ? apps.map((a) => (
                        <div key={a.id} className="p-6 bg-white border border-gray-100 rounded-3xl hover-card transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-secondary-50 text-secondary-600 rounded-2xl group-hover:bg-secondary-500 group-hover:text-white transition-all">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 group-hover:text-secondary-600 transition-colors uppercase tracking-tight truncate max-w-[150px]">{a.job_title}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                        <Clock className="w-3 h-3 text-secondary-400" /> {new Date(a.applied_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <StatusBadge status={a.status} />
                                {a.reason && <p className="text-[10px] text-rose-500 max-w-[150px] text-right bg-rose-50 p-1 px-2 rounded-lg font-bold">REASON: {a.reason}</p>}
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-60">
                            <FileText className="w-16 h-16 mb-4 stroke-1" />
                            <p className="font-bold text-sm tracking-widest">No Applications Yet!</p>
                            <p className="text-[10px] mt-2 text-center uppercase">Dream job wait kar rahi hai.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ApplicationStatus;
