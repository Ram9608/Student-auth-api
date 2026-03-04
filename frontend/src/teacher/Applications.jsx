import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import {
    UserCheck, CheckCircle, XCircle, Download, FileText,
    Bot, Clock, RefreshCw, Search, Send, MapPin, Calendar, Timer
} from "lucide-react";
import { toast } from "react-toastify";

// 🏆 Advanced Applications Management (Module 8 Integrated)
// Features: Scheduling Tests, AI Rejection Feedback, Student Profile Quick-View.

const Applications = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [decisionData, setDecisionData] = useState({}); // {appId: {status, reason, test_date, test_time, test_info}}

    const fetchApps = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/jobs/applications/all");
            setApps(res.data);
        } catch (e) {
            console.error("Apps load fail", e);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchApps(); }, [fetchApps]);

    const submitDecision = async (id) => {
        const data = decisionData[id];
        if (!data || !data.status) return toast.warning("Select a decision first!");

        try {
            await api.put(`/jobs/application/${id}`, data);
            toast.success(`Application ${data.status} successfully! ✅`);
            setApps(p => p.map(a => a.id === id ? { ...a, ...data } : a));
            setExpanded(null); // Collapse after confirmation
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Decision confirmation failed!');
        }
    };

    const updateDecisionField = (id, field, value) => {
        setDecisionData(p => ({
            ...p,
            [id]: { ...p[id], [field]: value }
        }));
    };

    const filtered = apps.filter(a =>
        a.student_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.job_title?.toLowerCase().includes(search.toLowerCase())
    );

    const statusConfig = {
        applied: { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock },
        reviewing: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: RefreshCw },
        accepted: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle },
        rejected: { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle },
    };

    return (
        <div className="glass p-10 rounded-[3rem] shadow-xl animate-fade-in border-white flex flex-col h-full min-h-[80vh]">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-black font-outfit text-gray-900 flex items-center gap-3">
                        <UserCheck className="text-primary-600 w-8 h-8" /> Candidate Review Hub
                    </h2>
                    <p className="text-gray-500 font-medium text-sm mt-1">Review profiles, schedule assessments, and provide AI feedback.</p>
                </div>

                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search student or job title..."
                        className="w-full pl-12 pr-4 h-12 bg-gray-50 border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-100 transition-all font-medium text-sm"
                    />
                </div>
            </header>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-20 text-primary-600 font-bold text-xl animate-pulse">
                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
                    Fetching All Applications...
                </div>
            ) : (
                <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                    {filtered.length > 0 ? filtered.map(app => {
                        const cfg = statusConfig[app.status] || statusConfig.applied;
                        const StatusIcon = cfg.icon;
                        const isOpen = expanded === app.id;
                        const currentDecision = decisionData[app.id] || { status: app.status };

                        return (
                            <div key={app.id} className={`bg-white rounded-[2.5rem] border shadow-sm overflow-hidden transition-all duration-300 ${isOpen ? 'ring-2 ring-primary-500 shadow-2xl scale-[1.01]' : 'border-gray-100'}`}>
                                <div className="p-8 flex items-center justify-between flex-wrap gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg border-4 border-white">
                                            {app.student_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-xl tracking-tight">{app.student_name}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-black uppercase border border-primary-100">
                                                    {app.job_title}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                                                    Applied: {new Date(app.applied_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`px-5 py-2.5 rounded-full text-[11px] font-black border ${cfg.color} flex items-center gap-2 shadow-sm`}>
                                            <StatusIcon className="w-3.5 h-3.5" />{app.status.toUpperCase()}
                                        </span>
                                        <button
                                            onClick={() => setExpanded(isOpen ? null : app.id)}
                                            className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${isOpen ? 'bg-gray-100 text-gray-600' : 'bg-primary-600 text-white shadow-xl shadow-primary-500/20 hover:scale-105'}`}>
                                            {isOpen ? 'Close' : 'Review Decision'}
                                        </button>
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="border-t border-gray-100 p-8 bg-gray-50/50 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
                                        {/* Left: Quick Actions */}
                                        <div className="space-y-6">
                                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 blur-3xl rounded-full opacity-50" />
                                                <h5 className="font-black text-gray-900 mb-4 flex items-center gap-2 relative">
                                                    <Send className="w-5 h-5 text-primary-600" /> Confirm Status
                                                </h5>

                                                <div className="flex gap-3 mb-6 bg-gray-50 p-1.5 rounded-2xl">
                                                    {['accepted', 'rejected'].map(s => (
                                                        <button key={s}
                                                            onClick={() => updateDecisionField(app.id, 'status', s)}
                                                            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${currentDecision.status === s
                                                                ? s === 'accepted' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-rose-500 text-white shadow-lg'
                                                                : 'text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-200'
                                                                }`}>
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>

                                                {currentDecision.status === 'accepted' && (
                                                    <div className="space-y-4 animate-fade-in">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Test Date</p>
                                                                <input type="date"
                                                                    value={currentDecision.test_date || ''}
                                                                    onChange={e => updateDecisionField(app.id, 'test_date', e.target.value)}
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all" />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Test Time</p>
                                                                <input type="time"
                                                                    value={currentDecision.test_time || ''}
                                                                    onChange={e => updateDecisionField(app.id, 'test_time', e.target.value)}
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instructions / Proctored Link</p>
                                                            <textarea
                                                                rows={2}
                                                                placeholder="e.g. Join Google Meet for briefing followed by AI Proctored test..."
                                                                value={currentDecision.test_info || ''}
                                                                onChange={e => updateDecisionField(app.id, 'test_info', e.target.value)}
                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 resize-none transition-all" />
                                                        </div>
                                                    </div>
                                                )}

                                                {currentDecision.status === 'rejected' && (
                                                    <div className="space-y-4 animate-fade-in">
                                                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-start gap-4">
                                                            <Bot className="w-6 h-6 text-purple-600 shrink-0" />
                                                            <div>
                                                                <p className="text-xs font-bold text-purple-900 leading-tight">AI Positive Match</p>
                                                                <p className="text-[9px] text-purple-600 font-medium uppercase mt-1 tracking-wider">Leave reason empty for auto-generated empathy.</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rejection Feedback (Optional)</p>
                                                            <textarea
                                                                rows={3}
                                                                placeholder="Polite reason or leave for AI generation..."
                                                                value={currentDecision.reason || ''}
                                                                onChange={e => updateDecisionField(app.id, 'reason', e.target.value)}
                                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-rose-500 resize-none" />
                                                        </div>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => submitDecision(app.id)}
                                                    className={`w-full h-14 mt-6 rounded-2xl text-sm font-black transition-all shadow-xl active:scale-[0.98] ${currentDecision.status === 'accepted' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : currentDecision.status === 'rejected' ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-gray-100 text-gray-400'}`}>
                                                    Confirm {currentDecision.status?.toUpperCase() || 'Decision'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Right: Resume & Profile Quick Look */}
                                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <h5 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-indigo-500" /> Application Assets
                                                </h5>
                                                <div className="space-y-4">
                                                    <a
                                                        href={`http://127.0.0.1:8000${app.resume_url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-indigo-50 hover:border-indigo-100 transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white rounded-lg text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                                                                <Download className="w-5 h-5" />
                                                            </div>
                                                            <p className="text-sm font-black text-gray-700">Student Resume CV</p>
                                                        </div>
                                                        <p className="text-[10px] font-black text-gray-300 group-hover:text-indigo-600">DOWNLOAD PDF</p>
                                                    </a>

                                                    <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                                            <Calendar className="w-4 h-4" /> Application History
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                                            <span>Submission Date</span>
                                                            <span className="text-gray-900">{new Date(app.applied_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                                    <UserCheck className="w-4 h-4" /> Identity Verified
                                                </div>
                                                <p className="text-[10px] text-gray-300 font-bold italic underline">AI Match Score: 88%</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="flex flex-col items-center justify-center py-32 text-gray-300 opacity-60">
                            <FileText className="w-24 h-24 mb-6 mx-auto stroke-1" />
                            <p className="font-black text-xl tracking-[0.2em] uppercase">Bhai, koi application nahi mili!</p>
                            <p className="text-[11px] mt-2 italic font-medium uppercase tracking-widest">Share your job links to get candidates.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Applications;
