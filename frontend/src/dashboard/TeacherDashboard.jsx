import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { toast } from 'react-toastify';
import FloatingChatbot from '../components/FloatingChatbot';
import {
    User, Briefcase, Users, Bot, PlusCircle, Trash2, Eye,
    CheckCircle, XCircle, Clock, Send, RefreshCw, Download, Github,
    Linkedin, Globe, ToggleLeft, ToggleRight, Search, Star, ExternalLink, ChevronUp, ChevronDown, UserCheck, Award
} from 'lucide-react';
import FaceVerify from '../components/FaceVerify';

const TABS = [
    { id: 'jobs', label: 'Opportunity Hub', icon: Briefcase },
    { id: 'applications', label: 'Review Center', icon: Users },
    { id: 'students', label: 'Candidate Oversight', icon: Users },
    { id: 'facelock', label: 'Identity Protection', icon: UserCheck }
];

// ── SHARED UI COMPONENTS (Defined outside to prevent re-render focus loss) ──
const Input = ({ label, value, onChange, placeholder = '', readOnly = false, type = "text" }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} readOnly={readOnly}
            className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium outline-none transition-all ${readOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'}`} />
    </div>
);

const Section = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Icon className="w-5 h-5" /></div>
            <h3 className="text-lg font-black text-gray-900">{title}</h3>
        </div>
        {children}
    </div>
);

const SelectField = ({ label, value, onChange, options }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50">
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);

// ─── MAIN TEACHER DASHBOARD ───────────────────────────────────────────────
const TeacherDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('jobs');
    const [stats, setStats] = useState({ jobs: 0, apps: 0, active: 0 });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && TABS.some(t => t.id === tab)) {
            setActiveTab(tab);
        }

        const loadStats = async () => {
            try {
                const [jobsRes, appsRes] = await Promise.all([
                    api.get('/jobs/my'),
                    api.get('/jobs/applications/all'),
                ]);
                setStats({
                    jobs: jobsRes.data.length,
                    apps: appsRes.data.length,
                    active: jobsRes.data.filter(j => j.is_active).length
                });
            } catch (e) { /* no-op */ }
        };
        loadStats();
    }, []);

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <Navbar role="teacher" />

                {/* Hero Strip */}
                <div className="bg-gradient-to-r from-indigo-700 via-indigo-900 to-slate-900 px-10 py-8 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight leading-none">
                                Welcome, <span className="underline decoration-white/60">{user?.full_name?.split(' ')[0]}</span>! 🎓
                            </h1>
                            <p className="text-indigo-200 text-[11px] mt-2 font-bold uppercase tracking-[0.2em] italic">Instructor Control Center &mdash; Intelligent Oversight Active</p>
                        </div>

                        <div className="flex gap-4 flex-wrap">
                            {[
                                { label: 'Live Slots', value: stats.active, color: 'bg-white/10' },
                                { label: 'Total Roles', value: stats.jobs, color: 'bg-white/10' },
                                { label: 'Submissions', value: stats.apps, color: 'bg-white/10' },
                            ].map((s, i) => (
                                <div key={i} className={`${s.color} backdrop-blur rounded-2xl px-6 py-3 text-center`}>
                                    <p className="text-3xl font-black">{s.value}</p>
                                    <p className="text-[10px] text-white/70 uppercase tracking-widest font-black">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6 flex-wrap">
                        {TABS.map(({ id, icon: Icon, label }) => (
                            <button key={id} onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === id ? 'bg-white text-secondary-700 shadow-lg' : 'bg-white/10 text-white/80 hover:bg-white/20'
                                    }`}>
                                <Icon className="w-4 h-4" />{label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-8 flex-1">
                    {activeTab === 'students' && <StudentsTab />}
                    {activeTab === 'jobs' && <JobsTab setStats={setStats} />}
                    {activeTab === 'applications' && <ApplicationsTab />}
                    {activeTab === 'facelock' && (
                        <div className="max-w-md mx-auto py-10">
                            <FaceVerify onVerified={() => toast.success("Identity Verified! ✅")} />
                            <div className="mt-6 p-6 bg-purple-50 rounded-2xl border border-purple-100 italic text-[11px] text-purple-700">
                                🔐 Administrator Biometric Lock. Use this to verify your identity before accessing sensitive student data.
                            </div>
                        </div>
                    )}
                </div>

                {/* Floating AI Assistant for Teachers */}
                <FloatingChatbot role="teacher" />
            </main>
        </div>
    );
};

// ─── 1. STUDENTS TAB ────────────────────────────────────────────────────────
const StudentsTab = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [profile, setProfile] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [testHistory, setTestHistory] = useState([]);
    const [showPublishModal, setShowPublishModal] = useState(null);
    const [feedbackText, setFeedbackText] = useState("");

    useEffect(() => {
        api.get('/users/students').then(r => setStudents(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const viewProfile = async (s) => {
        setSelectedStudent(s);
        setProfile(null);
        setTestHistory([]);
        try {
            const [pRes, tRes] = await Promise.all([
                api.get(`/jobs/student-profile/${s.id}`),
                api.get(`/teacher/student-tests/${s.id}`)
            ]);
            setProfile(pRes.data);
            setTestHistory(tRes.data);
        } catch { toast.error("Failed to load student data"); }
    };

    const generateTest = async () => {
        if (!selectedStudent) return;
        setGenerating(true);
        try {
            const { data } = await api.post(`/teacher/generate-test/${selectedStudent.id}`);
            toast.success(`${data.title} generated successfully! ✅`);
            // Refresh history
            const tRes = await api.get(`/teacher/student-tests/${selectedStudent.id}`);
            setTestHistory(tRes.data);
        } catch (err) {
            toast.error(err.response?.data?.detail || "Test generation failed");
        }
        setGenerating(false);
    };

    const handlePublish = async () => {
        if (!showPublishModal) return;
        try {
            await api.post(`/teacher/publish-result/${showPublishModal.result_id}`, {
                feedback: feedbackText || "Excellent performance. Keep it up!"
            });
            toast.success("Assessment result announced to student! 📢");
            setShowPublishModal(null);
            setFeedbackText("");
            // Refresh history
            const tRes = await api.get(`/teacher/student-tests/${selectedStudent.id}`);
            setTestHistory(tRes.data);
        } catch (err) {
            toast.error("Announcement failed.");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
                <h3 className="text-xl font-black text-gray-900 mb-4">Students List</h3>
                {loading ? <div className="py-10 text-center animate-pulse">Loading Students...</div> :
                    students.length === 0 ? <p className="text-gray-400 text-sm">No students found.</p> :
                        students.map(s => (
                            <div key={s.id} onClick={() => viewProfile(s)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedStudent?.id === s.id ? 'border-secondary-500 bg-secondary-50 shadow-md' : 'border-gray-100 bg-white hover:border-secondary-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center font-bold">
                                        {s.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{s.full_name}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{s.email}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                }
            </div>

            <div className="md:col-span-2">
                {selectedStudent ? (
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-fade-in sticky top-8">
                        <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">{selectedStudent.full_name}</h3>
                                <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                            </div>
                            <button onClick={generateTest} disabled={generating}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
                                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                                Generate AI Test
                            </button>
                        </div>

                        {profile ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Education</p>
                                        <p className="text-sm font-bold text-gray-900">{profile.degree || 'N/A'}</p>
                                        <p className="text-[10px] text-gray-500">{profile.college || 'No Info'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">CGPA</p>
                                        <p className="text-sm font-bold text-gray-900">{profile.cgpa || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">City</p>
                                        <p className="text-sm font-bold text-gray-900">{profile.city || 'N/A'}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Technical Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.technical_skills?.split(',').map((s, i) => (
                                            <span key={i} className="px-3 py-1 bg-secondary-50 text-secondary-700 text-[10px] font-black rounded-lg border border-secondary-100">
                                                {s.trim()}
                                            </span>
                                        )) || <span className="text-xs text-gray-400">No skills listed</span>}
                                    </div>
                                </div>

                                {profile.projects?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Projects</p>
                                        <div className="space-y-4">
                                            {profile.projects.map((p, i) => (
                                                <div key={i} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/30">
                                                    <p className="font-black text-gray-900 text-sm mb-1">{p.title}</p>
                                                    <p className="text-xs text-gray-500">{p.description}</p>
                                                    {p.tech_stack && <p className="text-[10px] text-indigo-500 font-bold mt-2 uppercase">Tech: {p.tech_stack}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Award className="w-4 h-4 text-indigo-600" /> Test & Assessment Oversight
                                    </h4>
                                    <div className="space-y-3">
                                        {testHistory.length === 0 ? (
                                            <p className="text-[11px] text-gray-400 italic">No assessments generated for this student yet.</p>
                                        ) : (
                                            testHistory.map(test => (
                                                <div key={test.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900">{test.title}</p>
                                                        <div className="flex gap-4 mt-1">
                                                            <span className={`text-[9px] font-bold uppercase tracking-wider ${test.status === 'Completed' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                                                {test.status}
                                                            </span>
                                                            {test.score !== null && (
                                                                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">
                                                                    Score: {test.score}%
                                                                </span>
                                                            )}
                                                            {test.warnings_count !== null && (
                                                                <span className={`text-[9px] font-bold uppercase tracking-wider ${test.warnings_count > 2 ? 'text-rose-500' : 'text-gray-400'}`}>
                                                                    Warnings: {test.warnings_count}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {test.status === 'Completed' && (
                                                        test.is_published ? (
                                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-100">
                                                                ANNOUNCED
                                                            </span>
                                                        ) : (
                                                            <button onClick={() => setShowPublishModal(test)}
                                                                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
                                                                Announce Result
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Publish Modal */}
                                {showPublishModal && (
                                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-fade-in">
                                        <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl border border-white/20">
                                            <h3 className="text-2xl font-black text-gray-900 mb-2">Announce Result</h3>
                                            <p className="text-xs text-gray-500 mb-8 lowercase italic font-medium">Providing feedback will immediately notify the student of their performance.</p>

                                            <div className="space-y-6">
                                                <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Assessment Title</p>
                                                        <p className="font-bold text-indigo-900">{showPublishModal.title}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Achieved Score</p>
                                                        <p className="text-2xl font-black text-indigo-600">{showPublishModal.score}%</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Instructor Feedback (Encouraging Message)</label>
                                                    <textarea
                                                        rows={4}
                                                        value={feedbackText}
                                                        onChange={e => setFeedbackText(e.target.value)}
                                                        placeholder="e.g. You performed exceptionally well in the coding section. Focus on improving your time complexity analysis."
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 resize-none" />
                                                </div>

                                                <div className="flex gap-4">
                                                    <button onClick={() => setShowPublishModal(null)}
                                                        className="flex-1 px-6 py-4 bg-gray-100 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
                                                        Cancel
                                                    </button>
                                                    <button onClick={handlePublish}
                                                        className="flex-[2] px-6 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                                                        Announce Now 📢
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-20 text-center animate-pulse text-gray-400">Loading student profile details...</div>
                        )}
                    </div>
                ) : (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border-2 border-dashed p-10">
                        <Users className="w-16 h-16 mb-4 opacity-10" />
                        <p className="font-bold text-gray-300">Select a student from the sidebar to begin</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── 2. JOBS TAB ────────────────────────────────────────────────────────────
const JobsTab = ({ setStats }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', skills_required: '', experience_required: 'fresher', job_type: 'full-time', location_type: 'remote', salary: '', last_date: '' });
    const [posting, setPosting] = useState(false);

    const loadJobs = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/jobs/my');
            setJobs(data);
            setStats(prev => ({ ...prev, jobs: data.length, active: data.filter(j => j.is_active).length }));
        } catch (e) { /* no-op */ }
        setLoading(false);
    }, [setStats]);

    useEffect(() => { loadJobs(); }, [loadJobs]);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const post = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.skills_required) return toast.warning('Fill all required fields!');
        setPosting(true);
        try {
            await api.post('/jobs/', form);
            toast.success('Job posted successfully! ✅');
            setForm({ title: '', description: '', skills_required: '', experience_required: 'fresher', job_type: 'full-time', location_type: 'remote', salary: '', last_date: '' });
            setShowForm(false);
            loadJobs();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Post failed!');
        }
        setPosting(false);
    };

    const toggle = async (id) => {
        try {
            const { data } = await api.patch(`/jobs/${id}/toggle`);
            toast.success(data.message);
            setJobs(p => p.map(j => j.id === id ? { ...j, is_active: data.is_active } : j));
        } catch { toast.error('Toggle failed!'); }
    };

    const del = async (id) => {
        if (!confirm('Delete this job? This will remove all applications.')) return;
        try {
            await api.delete(`/jobs/${id}`);
            toast.success('Job deleted.');
            setJobs(p => p.filter(j => j.id !== id));
        } catch { toast.error('Delete failed!'); }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900">My Job Postings</h3>
                <button onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black text-white shadow-lg transition-all"
                    style={{ background: showForm ? '#ef4444' : 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                    <PlusCircle className="w-4 h-4" />
                    {showForm ? 'Cancel' : 'Post New Job'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-secondary-100 animate-fade-in">
                    <h4 className="font-black text-gray-900 text-lg mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-secondary-600" /> Create New Job Opening
                    </h4>
                    <form onSubmit={post} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Title <span className="text-rose-500">*</span></label>
                                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Full Stack Developer" required
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-secondary-500 focus:ring-4 focus:ring-secondary-50" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Salary / Stipend</label>
                                <input value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="e.g. 4-8 LPA / 15k/month"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-secondary-500 focus:ring-4 focus:ring-secondary-50" />
                            </div>
                            <SelectField label="Experience Required" value={form.experience_required} onChange={v => set('experience_required', v)}
                                options={[{ value: 'fresher', label: 'Fresher' }, { value: '0-2', label: '0–2 Years' }, { value: '2-5', label: '2–5 Years' }, { value: '5+', label: '5+ Years' }]} />
                            <SelectField label="Job Type" value={form.job_type} onChange={v => set('job_type', v)}
                                options={[{ value: 'full-time', label: 'Full-Time' }, { value: 'part-time', label: 'Part-Time' }, { value: 'internship', label: 'Internship' }]} />
                            <SelectField label="Location Type" value={form.location_type} onChange={v => set('location_type', v)}
                                options={[{ value: 'remote', label: 'Remote' }, { value: 'onsite', label: 'Onsite' }, { value: 'hybrid', label: 'Hybrid' }]} />
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Last Date to Apply</label>
                                <input type="date" value={form.last_date} onChange={e => set('last_date', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-secondary-500 focus:ring-4 focus:ring-secondary-50" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Required Skills <span className="text-rose-500">*</span> (comma separated)</label>
                            <input value={form.skills_required} onChange={e => set('skills_required', e.target.value)} placeholder="Python, React, PostgreSQL..." required
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-secondary-500 focus:ring-4 focus:ring-secondary-50" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Description <span className="text-rose-500">*</span></label>
                            <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the role..." required
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-secondary-500 focus:ring-4 focus:ring-secondary-50 resize-none" />
                        </div>
                        <button type="submit" disabled={posting}
                            className="w-full h-14 text-sm font-black text-white rounded-2xl gap-2 flex items-center justify-center transition-all shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                            {posting ? 'Posting...' : 'Launch Job Posting'}
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {loading ? <div className="py-20 text-center text-secondary-600 font-bold animate-pulse">Loading jobs...</div>
                    : jobs.length === 0 ? (
                        <div className="py-24 flex flex-col items-center text-gray-400 bg-white rounded-3xl border border-gray-100">
                            <Briefcase className="w-16 h-16 mb-4 stroke-1" />
                            <p className="font-bold">No jobs posted yet</p>
                        </div>
                    ) : jobs.map(job => (
                        <div key={job.id} className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all ${job.is_active ? 'border-gray-100' : 'border-gray-200 opacity-70'}`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h4 className="font-black text-gray-900 text-lg">{job.title}</h4>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${job.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                        {job.is_active ? 'ACTIVE' : 'CLOSED'}
                                    </span>
                                    <span className="px-3 py-1 bg-secondary-50 text-secondary-700 rounded-full text-[10px] font-black border border-secondary-100 capitalize">{job.job_type}</span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium">
                                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{job.application_count} Applications</span>
                                    {job.salary && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{job.salary}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => toggle(job.id)}
                                    className={`p-2.5 rounded-xl border transition-all ${job.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                    {job.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                </button>
                                <button onClick={() => del(job.id)} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl border border-rose-100">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

// ─── 3. APPLICATIONS TAB ────────────────────────────────────────────────────
const ApplicationsTab = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [reasonMap, setReasonMap] = useState({});
    const [studentProfile, setStudentProfile] = useState({});

    useEffect(() => {
        api.get('/jobs/applications/all').then(r => setApps(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const submitDecision = async (id) => {
        const decisionData = reasonMap[id] || {};
        if (!decisionData.status) return toast.warning("Select a decision first!");

        try {
            await api.put(`/jobs/application/${id}`, decisionData);
            toast.success(`Application ${decisionData.status} successfully! ✅`);
            setApps(p => p.map(a => a.id === id ? { ...a, ...decisionData } : a));
            setExpanded(null); // Collapse after confirmation
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Decision confirmation failed!');
        }
    };

    const loadStudentProfile = async (studentId) => {
        if (studentProfile[studentId]) return;
        try {
            const { data } = await api.get(`/jobs/student-profile/${studentId}`);
            setStudentProfile(p => ({ ...p, [studentId]: data }));
        } catch { /* no-op */ }
    };

    const filtered = apps.filter(a =>
        a.student_name.toLowerCase().includes(search.toLowerCase()) ||
        a.job_title.toLowerCase().includes(search.toLowerCase())
    );

    const statusConfig = {
        applied: { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock },
        reviewing: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: RefreshCw },
        accepted: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle },
        rejected: { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle },
    };

    return (
        <div className="space-y-5 max-w-5xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-xl font-black text-gray-900">All Applications</h3>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                        className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none w-64" />
                </div>
            </div>

            {loading ? <div className="py-20 text-center animate-pulse">Loading...</div>
                : filtered.length === 0 ? <div className="py-24 text-center bg-white rounded-3xl border border-gray-100 font-bold text-gray-400">No applications yet</div>
                    : filtered.map(app => {
                        const cfg = statusConfig[app.status] || statusConfig.applied;
                        const StatusIcon = cfg.icon;
                        const isOpen = expanded === app.id;
                        const profile = studentProfile[app.student_id];

                        return (
                            <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl">
                                            {app.student_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-lg">{app.student_name}</h4>
                                            <p className="text-xs text-gray-500">Applied for: <span className="font-bold text-secondary-600">{app.job_title}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-4 py-2 rounded-full text-[11px] font-black border ${cfg.color} flex items-center gap-2`}>
                                            <StatusIcon className="w-3 h-3" />{app.status.toUpperCase()}
                                        </span>
                                        <button onClick={() => { setExpanded(isOpen ? null : app.id); if (!isOpen) loadStudentProfile(app.student_id); }}
                                            className="px-4 py-2 bg-secondary-50 text-secondary-700 rounded-xl text-xs font-black border border-secondary-100">
                                            {isOpen ? 'Hide' : 'Review'}
                                        </button>
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="border-t border-gray-100 p-6 bg-gray-50/50 space-y-6">
                                        {profile && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white rounded-2xl p-5 border border-gray-100">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase">Degree</p>
                                                    <p className="text-sm font-bold">{profile.degree}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase">CGPA</p>
                                                    <p className="text-sm font-bold">{profile.cgpa}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase">Resume</p>
                                                    {app.resume_url ? (
                                                        <button
                                                            onClick={() => window.open(`http://127.0.0.1:8000/resumes/download/${app.student_id}`, '_blank')}
                                                            className="mt-1 flex items-center gap-2 text-primary-600 font-extrabold text-xs hover:underline uppercase tracking-tighter"
                                                        >
                                                            <Download className="w-3.5 h-3.5" /> View PDF
                                                        </button>
                                                    ) : (
                                                        <p className="text-rose-500 font-bold text-[10px]">NO RESUME</p>
                                                    )}
                                                </div>
                                                <div className="col-span-full mt-2">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Technical Skills</p>
                                                    <p className="text-sm text-gray-700 font-medium">{profile.technical_skills}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="bg-white rounded-2xl p-5 border border-gray-100">
                                            <h5 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                                                <Send className="w-4 h-4 text-secondary-600" />
                                                Review Decision
                                            </h5>

                                            <div className="space-y-4">
                                                {/* Status Selector UI */}
                                                <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                                                    {['accepted', 'rejected'].map(s => (
                                                        <button key={s}
                                                            onClick={() => setReasonMap(p => ({ ...p, [app.id]: { ...p[app.id], status: s } }))}
                                                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${reasonMap[app.id]?.status === s
                                                                ? s === 'accepted' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-rose-500 text-white shadow-lg'
                                                                : 'text-gray-400 hover:text-gray-600'
                                                                }`}>
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Multi-feature input based on status choice */}
                                                {reasonMap[app.id]?.status === 'accepted' && (
                                                    <div className="grid grid-cols-2 gap-3 animate-fade-in">
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase">Test Date</p>
                                                            <input type="date"
                                                                value={reasonMap[app.id]?.test_date || ''}
                                                                onChange={e => setReasonMap(p => ({ ...p, [app.id]: { ...p[app.id], test_date: e.target.value } }))}
                                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-emerald-500" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase">Test Time</p>
                                                            <input type="time"
                                                                value={reasonMap[app.id]?.test_time || ''}
                                                                onChange={e => setReasonMap(p => ({ ...p, [app.id]: { ...p[app.id], test_time: e.target.value } }))}
                                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-emerald-500" />
                                                        </div>
                                                        <div className="col-span-full space-y-1">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase">Instructions / Meeting Link</p>
                                                            <textarea
                                                                rows={2}
                                                                placeholder="e.g. Join the Google Meet for pre-test briefing..."
                                                                value={reasonMap[app.id]?.test_info || ''}
                                                                onChange={e => setReasonMap(p => ({ ...p, [app.id]: { ...p[app.id], test_info: e.target.value } }))}
                                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-emerald-500 resize-none" />
                                                        </div>
                                                    </div>
                                                )}

                                                {reasonMap[app.id]?.status === 'rejected' && (
                                                    <div className="space-y-1 animate-fade-in">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase">Rejection Rationale (Optional - AI will generate if empty)</p>
                                                        <textarea
                                                            rows={2}
                                                            placeholder="Leave empty for AI-generated positive feedback..."
                                                            value={reasonMap[app.id]?.reason || ''}
                                                            onChange={e => setReasonMap(p => ({ ...p, [app.id]: { ...p[app.id], reason: e.target.value } }))}
                                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-rose-500 resize-none" />
                                                    </div>
                                                )}

                                                <button
                                                    disabled={!reasonMap[app.id]?.status}
                                                    onClick={() => submitDecision(app.id)}
                                                    className={`w-full h-11 rounded-xl text-sm font-black transition-all shadow-lg ${reasonMap[app.id]?.status === 'accepted' ? 'bg-emerald-500 text-white hover:bg-emerald-600' :
                                                        reasonMap[app.id]?.status === 'rejected' ? 'bg-rose-500 text-white hover:bg-rose-600' :
                                                            'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}>
                                                    Confirm {reasonMap[app.id]?.status?.toUpperCase() || 'Decision'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
        </div>
    );
};

// ─── 4. AI CHATBOT TAB (Teacher Mode) ──────────────────────────────────────
const ChatbotTab = ({ user }) => {
    const [msgs, setMsgs] = useState([{
        role: 'assistant',
        text: `Hi ${user?.full_name?.split(' ')[0]}! 👋 I'm your AI Recruitment Assistant. How can I help with your hiring today?`
    }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    const quickQuestions = ['Best skills for Python role?', 'Writing a good JD?', 'Interview questions?'];

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

    const send = async (q) => {
        const question = q || input.trim();
        if (!question) return;
        setInput('');
        setMsgs(p => [...p, { role: 'user', text: question }]);
        setLoading(true);
        try {
            const { data } = await api.post('/chatbot/ask', { message: question });
            setMsgs(p => [...p, { role: 'assistant', text: data.reply || data.answer || 'No response.' }]);
        } catch {
            setMsgs(p => [...p, { role: 'assistant', text: 'Error connecting to AI.' }]);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl h-[70vh] flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                <h4 className="font-black">AI Recruitment Assistant</h4>
                <p className="text-xs text-purple-200">System Logical Mode · Groq LPU</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                {msgs.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && <div className="text-xs font-bold text-gray-400 animate-pulse">Assistant is thinking...</div>}
                <div ref={bottomRef} />
            </div>
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2 mb-3">
                    {quickQuestions.map(q => <button key={q} onClick={() => send(q)} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black border border-purple-100 hover:bg-purple-600 hover:text-white transition-all">{q}</button>)}
                </div>
                <div className="flex gap-2">
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask something..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                    <button onClick={() => send()} disabled={loading} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg"><Send className="w-5 h-5" /></button>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
