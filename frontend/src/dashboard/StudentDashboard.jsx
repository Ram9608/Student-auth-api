import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { toast } from 'react-toastify';
import {
    User, BookOpen, Code, Briefcase, FileText, BarChart2,
    Upload, CheckCircle, XCircle, Clock, AlertCircle, Sparkles,
    Github, Linkedin, Globe, GraduationCap,
    PlusCircle, Trash2, ExternalLink, Activity,
    Target, Award, RefreshCw, Send, Search, Bot,
    X, TrendingUp, Zap, ChevronRight, Star, UserCheck
} from 'lucide-react';
import FloatingChatbot from '../components/FloatingChatbot';
import FaceVerify from '../components/FaceVerify';

// ── TABS (no chatbot tab — it's floating) ─────────────────
const TABS = [
    { id: 'profile', label: 'Identity Portal', icon: User },
    { id: 'resume', label: 'Credentials Hub', icon: FileText },
    { id: 'jobs', label: 'Career Streams', icon: Briefcase },
    { id: 'applications', label: 'My Submissions', icon: CheckCircle },
    { id: 'assessments', label: 'Proctoring Portal', icon: Target },
    { id: 'analyzer', label: 'Match Analytics', icon: BarChart2 },
    { id: 'courses', label: 'Up-Skill Path', icon: BookOpen },
    { id: 'facelock', label: 'Biometric Check-In', icon: UserCheck },
];
// ── MAIN DASHBOARD ─────────────────────────────────────────
const StudentDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [resumeStatus, setResumeStatus] = useState({ uploaded: false, has_text: false });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && TABS.some(t => t.id === tab)) {
            setActiveTab(tab);
        }

        const load = async () => {
            try {
                const [pRes, rRes] = await Promise.all([
                    api.get('/profile/me'),
                    api.get('/resumes/status'),
                ]);
                setProfile(pRes.data);
                setResumeStatus(rRes.data);
            } catch (e) { /* no-op */ }
        };
        load();
    }, []);

    const completionPct = () => {
        if (!profile?.profile_complete) return 0;
        const fields = ['mobile', 'city', 'degree', 'technical_skills', 'github'];
        const filled = fields.filter(f => profile[f]).length;
        return Math.round((filled / fields.length) * 100);
    };

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                <Navbar role="student" />

                {/* Hero Strip */}
                <div className="bg-gradient-to-r from-indigo-700 via-indigo-900 to-slate-900 px-10 py-8 text-white">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight leading-none">
                                Welcome, <span className="underline decoration-white/60">{user?.full_name?.split(' ')[0]}</span>! 🎓
                            </h1>
                            <p className="text-indigo-200 text-[11px] mt-2 font-bold uppercase tracking-[0.2em] italic">Student Control Center &mdash; AI Career Hub Active</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Resume Status */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black ${resumeStatus.uploaded ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-200 border border-rose-400/30'}`}>
                                {resumeStatus.uploaded ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                Resume {resumeStatus.uploaded ? 'Uploaded ✅' : 'Not Uploaded ❌'}
                            </div>
                            {/* Profile completion */}
                            <div className="bg-white/10 backdrop-blur rounded-2xl px-5 py-3 text-center">
                                <p className="text-[10px] uppercase font-black tracking-widest text-primary-200 mb-1">Profile</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-28 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${completionPct()}%` }} />
                                    </div>
                                    <span className="font-black text-sm">{completionPct()}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Bar */}
                    <div className="flex gap-2 mt-6 flex-wrap">
                        {TABS.map(({ id, icon: Icon, label }) => (
                            <button key={id} onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === id ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/10 text-white/80 hover:bg-white/20'
                                    }`}>
                                <Icon className="w-4 h-4" />{label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Resume Banner (if not uploaded) */}
                {!resumeStatus.uploaded && activeTab !== 'resume' && (
                    <div className="mx-8 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 animate-fade-in">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <p className="text-sm text-amber-800 font-medium">
                            Upload your resume to unlock <strong>AI Job Suggestions</strong>, <strong>Course Recommendations</strong>, and <strong>Resume Analysis</strong>. &nbsp;
                        </p>
                        <button onClick={() => setActiveTab('resume')}
                            className="ml-auto flex items-center gap-1 px-4 py-2 bg-amber-500 text-white text-xs font-black rounded-xl hover:bg-amber-600 transition-all whitespace-nowrap">
                            Upload Now <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Tab Panels */}
                <div className="p-8 flex-1">
                    {activeTab === 'profile' && <ProfileTab profile={profile} setProfile={setProfile} user={user} />}
                    {activeTab === 'resume' && <ResumeTab resumeStatus={resumeStatus} setResumeStatus={setResumeStatus} />}
                    {activeTab === 'jobs' && <JobsTab resumeUploaded={resumeStatus.uploaded} />}
                    {activeTab === 'applications' && <ApplicationsTab />}
                    {activeTab === 'assessments' && <AssessmentsTab />}
                    {activeTab === 'analyzer' && <AnalyzerTab resumeUploaded={resumeStatus.uploaded} setActiveTab={setActiveTab} />}
                    {activeTab === 'courses' && <CoursesTab resumeUploaded={resumeStatus.uploaded} setActiveTab={setActiveTab} />}
                    {activeTab === 'facelock' && (
                        <div className="max-w-md mx-auto py-10">
                            <FaceVerify onVerified={() => toast.success("Identity Verified & Logged! 🛡️")} />
                            <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100 italic text-[11px] text-blue-700">
                                🛡️ Identity Guard is active. Every verification logs your presence in the Attendance System.
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <FloatingChatbot role="student" />
        </div>
    );
};

// ── SHARED UI COMPONENTS (Defined outside to prevent re-render focus loss) ──
const Input = ({ label, value, onChange, type = 'text', placeholder = '', required = false, readOnly = false }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}{required && <span className="text-rose-500 ml-1">*</span>}</label>
        <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} readOnly={readOnly}
            className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium outline-none transition-all ${readOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-50'}`} />
    </div>
);

const Select = ({ label, value, onChange, options }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <select value={value || ''} onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50">
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);

const Section = ({ icon: Icon, title, color = 'primary', children }) => (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
            <div className={`p-2.5 bg-${color}-50 text-${color}-600 rounded-xl`}><Icon className="w-5 h-5" /></div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">{title}</h3>
        </div>
        {children}
    </div>
);

// ── PROFILE TAB ────────────────────────────────────────────────────────────
const ProfileTab = ({ profile, setProfile, user }) => {
    const [form, setForm] = useState({
        mobile: '', city: '', state: '', experience_type: 'fresher',
        availability: '', work_authorization: true, expected_salary: '',
        degree: '', college: '', passing_year: '', cgpa: '',
        technical_skills: '', soft_skills: '',
        github: '', linkedin: '', portfolio: '',
        projects: [{ title: '', description: '', tech_stack: '', github_link: '' }],
        internships: [{ company: '', duration: '', role: '', certificate: '' }],
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile?.profile_complete) {
            setForm(prev => ({
                ...prev, ...profile,
                projects: profile.projects?.length ? profile.projects : prev.projects,
                internships: profile.internships?.length ? profile.internships : prev.internships,
            }));
        }
    }, [profile]);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const setProject = (i, k, v) => setForm(p => { const a = [...p.projects]; a[i][k] = v; return { ...p, projects: a }; });
    const setIntern = (i, k, v) => setForm(p => { const a = [...p.internships]; a[i][k] = v; return { ...p, internships: a }; });
    const addProject = () => setForm(p => ({ ...p, projects: [...p.projects, { title: '', description: '', tech_stack: '', github_link: '' }] }));
    const addIntern = () => setForm(p => ({ ...p, internships: [...p.internships, { company: '', duration: '', role: '', certificate: '' }] }));
    const removeProject = i => setForm(p => ({ ...p, projects: p.projects.filter((_, idx) => idx !== i) }));
    const removeIntern = i => setForm(p => ({ ...p, internships: p.internships.filter((_, idx) => idx !== i) }));

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/profile/save', form);
            setProfile(prev => ({ ...prev, ...form, profile_complete: true }));
            toast.success('Profile saved! ✅');
        } catch (err) { toast.error(err.response?.data?.detail || 'Save failed!'); }
        setSaving(false);
    };

    return (
        <form onSubmit={submit} className="space-y-6 max-w-4xl">
            <Section icon={User} title="Personal Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input label="Full Name" value={user?.full_name} onChange={() => { }} readOnly />
                    <Input label="Email ID" value={user?.email} onChange={() => { }} readOnly />
                    <Input label="Mobile Number" value={form.mobile} onChange={v => set('mobile', v)} placeholder="9876543210" required />
                    <Input label="Current City" value={form.city} onChange={v => set('city', v)} placeholder="Mumbai" required />
                    <Input label="State" value={form.state} onChange={v => set('state', v)} placeholder="Maharashtra" />
                    <Select label="Fresher / Experienced" value={form.experience_type} onChange={v => set('experience_type', v)}
                        options={[{ value: 'fresher', label: 'Fresher' }, { value: 'experienced', label: 'Experienced' }]} />
                    <Input label="Availability / Joining Timeline" value={form.availability} onChange={v => set('availability', v)} placeholder="Immediate / 1 Month / 3 Months" />
                    <Input label="Expected Salary / CTC (Optional)" value={form.expected_salary} onChange={v => set('expected_salary', v)} placeholder="e.g. 4-6 LPA" />
                    <div className="space-y-1.5 col-span-full">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Work Authorization</label>
                        <div className="flex gap-4">
                            {['Indian Citizen – Yes', 'Need Sponsorship – No'].map((opt, i) => (
                                <label key={i} className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-xl hover:border-primary-400 transition-all">
                                    <input type="radio" name="work_auth" checked={form.work_authorization === (i === 0)} onChange={() => set('work_authorization', i === 0)} className="accent-primary-600" />
                                    <span className="text-sm font-medium text-gray-700">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            <Section icon={GraduationCap} title="Education Details" color="violet">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Select label="Degree" value={form.degree} onChange={v => set('degree', v)}
                        options={[{ value: '', label: 'Select Degree' }, { value: 'B.Tech', label: 'B.Tech' }, { value: 'BCA', label: 'BCA' }, { value: 'MCA', label: 'MCA' }, { value: 'M.Tech', label: 'M.Tech' }, { value: 'BSc', label: 'BSc' }, { value: 'MBA', label: 'MBA' }, { value: 'Other', label: 'Other' }]} />
                    <Input label="College / University" value={form.college} onChange={v => set('college', v)} placeholder="IIT Bombay / Delhi University" />
                    <Input label="Passing Year" value={form.passing_year} onChange={v => set('passing_year', v)} placeholder="2024" />
                    <Input label="CGPA / Percentage" value={form.cgpa} onChange={v => set('cgpa', v)} placeholder="8.5 / 85%" />
                </div>
            </Section>

            <Section icon={Code} title="Skills" color="emerald">
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Technical Skills <span className="text-primary-500 normal-case font-medium">(comma separated — used in ML job matching)</span></label>
                        <textarea rows={2} value={form.technical_skills || ''} onChange={e => set('technical_skills', e.target.value)}
                            placeholder="Python, JavaScript, React, FastAPI, PostgreSQL, Docker, Git, ML..."
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 resize-none" />
                        {form.technical_skills && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {form.technical_skills.split(',').map((s, i) => s.trim() && (
                                    <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 text-[11px] font-bold rounded-full border border-primary-100">{s.trim()}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    <Input label="Soft Skills (comma separated)" value={form.soft_skills} onChange={v => set('soft_skills', v)} placeholder="Communication, Problem Solving, Teamwork..." />
                </div>
            </Section>

            <Section icon={Target} title="Projects (Important for Freshers)" color="rose">
                <div className="space-y-4 mb-4">
                    {form.projects.map((proj, i) => (
                        <div key={i} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 relative">
                            <button type="button" onClick={() => removeProject(i)} className="absolute top-3 right-3 p-1 text-gray-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Project Title" value={proj.title} onChange={v => setProject(i, 'title', v)} placeholder="AI Resume Analyzer" required={i === 0} />
                                <Input label="Tech Stack" value={proj.tech_stack} onChange={v => setProject(i, 'tech_stack', v)} placeholder="Python, React, FastAPI" />
                                <div className="space-y-1.5 col-span-full">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                                    <textarea rows={2} value={proj.description} onChange={e => setProject(i, 'description', e.target.value)} placeholder="Brief project description..."
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 resize-none" />
                                </div>
                                <Input label="GitHub Link" value={proj.github_link} onChange={v => setProject(i, 'github_link', v)} placeholder="https://github.com/..." />
                            </div>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addProject} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-black border border-rose-100 hover:bg-rose-500 hover:text-white transition-all">
                    <PlusCircle className="w-4 h-4" /> Add Project
                </button>
            </Section>

            <Section icon={Award} title="Internship / Training (Optional)" color="amber">
                <div className="space-y-4 mb-4">
                    {form.internships.map((intern, i) => (
                        <div key={i} className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 relative">
                            <button type="button" onClick={() => removeIntern(i)} className="absolute top-3 right-3 p-1 text-gray-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Company / Platform" value={intern.company} onChange={v => setIntern(i, 'company', v)} placeholder="Google / Coursera" />
                                <Input label="Duration" value={intern.duration} onChange={v => setIntern(i, 'duration', v)} placeholder="3 Months" />
                                <Input label="Role" value={intern.role} onChange={v => setIntern(i, 'role', v)} placeholder="ML Intern" />
                                <Input label="Certificate Link" value={intern.certificate} onChange={v => setIntern(i, 'certificate', v)} placeholder="https://..." />
                            </div>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addIntern} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-black border border-amber-100 hover:bg-amber-500 hover:text-white transition-all">
                    <PlusCircle className="w-4 h-4" /> Add Internship
                </button>
            </Section>

            <Section icon={Github} title="Profile Links" color="indigo">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {[
                        { icon: Github, label: 'GitHub *', key: 'github', placeholder: 'https://github.com/username' },
                        { icon: Linkedin, label: 'LinkedIn', key: 'linkedin', placeholder: 'https://linkedin.com/in/...' },
                        { icon: Globe, label: 'Portfolio', key: 'portfolio', placeholder: 'https://myportfolio.com' },
                    ].map(({ icon: Icon, label, key, placeholder }) => (
                        <div key={key} className="space-y-1.5">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest"><Icon className="inline w-3 h-3 mr-1" />{label}</label>
                            <input value={form[key] || ''} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50" />
                        </div>
                    ))}
                </div>
            </Section>

            <button type="submit" disabled={saving} className="btn-primary w-full h-16 text-base font-black gap-3 shadow-2xl max-w-4xl">
                {saving ? <span className="flex items-center gap-3"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span>
                    : <span className="flex items-center gap-3"><CheckCircle className="w-5 h-5" />Save Complete Profile</span>}
            </button>
        </form>
    );
};

// ── RESUME TAB ─────────────────────────────────────────────────────────────
const ResumeTab = ({ resumeStatus, setResumeStatus }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(resumeStatus.uploaded);

    const upload = async () => {
        if (!file) return toast.warning('Please select a PDF file first!');
        const form = new FormData();
        form.append('file', file);
        setUploading(true);
        try {
            await api.post('/resumes/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            setUploaded(true);
            setResumeStatus({ uploaded: true, has_text: true });
            toast.success('Resume uploaded! AI text extracted. Jobs & Courses now personalized! 🎯');
        } catch (err) { toast.error(err.response?.data?.detail || 'Upload failed!'); }
        setUploading(false);
    };

    return (
        <div className="max-w-xl space-y-5">
            {uploaded && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                        <p className="font-black text-emerald-800 text-sm">Resume Uploaded & Active ✅</p>
                        <p className="text-xs text-emerald-600 mt-0.5">AI jobs & course suggestions are now personalized based on your resume!</p>
                    </div>
                </div>
            )}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl"><FileText className="w-5 h-5" /></div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900">Resume / CV Upload</h3>
                        <p className="text-xs text-gray-500 mt-0.5">PDF text auto-extracted → ML job matching → Smart course suggestions</p>
                    </div>
                </div>
                <div className={`relative border-2 border-dashed rounded-3xl p-14 flex flex-col items-center justify-center cursor-pointer transition-all ${uploaded ? 'border-emerald-300 bg-emerald-50/30' : 'border-primary-200 bg-primary-50/20 hover:bg-primary-50/40'}`}>
                    <input type="file" accept=".pdf" onChange={e => { setFile(e.target.files[0]); setUploaded(false); }} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {file ? (
                        <div className="flex flex-col items-center gap-3">
                            <FileText className={`w-14 h-14 ${uploaded ? 'text-emerald-500' : 'text-primary-500'} animate-bounce`} />
                            <p className="font-black text-gray-900 text-sm">{file.name}</p>
                            <span className={`px-3 py-1 rounded-full text-[11px] font-black ${uploaded ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-100 text-primary-700'}`}>{uploaded ? 'Uploaded ✅' : 'Ready to Upload'}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                            <Upload className="w-14 h-14 stroke-1" />
                            <p className="font-black text-sm uppercase tracking-widest">{uploaded ? 'Drop new PDF to re-upload' : 'Drop PDF here or Click to Browse'}</p>
                            <p className="text-xs text-center max-w-xs">AI extracts text → TF-IDF ML matches with internal jobs → Courses suggested from missing skills</p>
                        </div>
                    )}
                </div>
                <button onClick={upload} disabled={!file || uploading}
                    className="btn-primary w-full h-14 mt-5 text-sm font-black gap-2 disabled:opacity-50">
                    {uploading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Extracting & Processing...</span>
                        : <span className="flex items-center gap-2"><Upload className="w-4 h-4" />{uploaded ? 'Re-Upload Resume' : 'Upload Resume (PDF only)'}</span>}
                </button>
            </div>
        </div>
    );
};

// ── JOBS TAB (ML-based suggestions) ────────────────────────────────────────
const JobsTab = ({ resumeUploaded }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [source, setSource] = useState('');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get('/resumes/job-suggestions');
                setSuggestions(data.suggestions || []);
                setSource(data.source || '');
            } catch {
                // Fallback: load all jobs
                try {
                    const { data } = await api.get('/jobs/');
                    setSuggestions(data.map(j => ({ ...j, is_suggested: false })));
                    setSource('All Available Jobs');
                } catch { /* no-op */ }
            }
            setLoading(false);
        };
        load();
    }, []);

    const apply = async (id) => {
        try {
            await api.post(`/jobs/apply/${id}`);
            toast.success('Applied successfully! Resume attached automatically. ✅');
        } catch (err) { toast.warning(err.response?.data?.detail || 'Apply failed!'); }
    };

    const filtered = suggestions.filter(j => j.title?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-5">
            {/* Source Badge */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h3 className="text-xl font-black text-gray-900">Job Openings</h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-primary-500" />
                        <span className="font-medium text-primary-600">{source}</span>
                    </p>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..."
                        className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 w-56" />
                </div>
            </div>

            {!resumeUploaded && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 text-sm">
                    <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <p className="text-blue-700 font-medium">Upload resume to get <strong>AI-matched job suggestions</strong> based on your skills via Internal API.</p>
                </div>
            )}

            {loading ? <div className="py-20 text-center text-primary-600 font-bold animate-pulse">Loading jobs...</div>
                : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filtered.map(job => (
                            <div key={job.id} className={`bg-white rounded-3xl p-7 shadow-sm border hover:shadow-md transition-all group ${job.is_suggested ? 'border-primary-200 ring-1 ring-primary-100' : 'border-gray-100'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl group-hover:bg-primary-500 group-hover:text-white transition-all">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {job.is_suggested && (
                                            <span className="px-2.5 py-1 bg-primary-50 text-primary-600 text-[10px] font-black rounded-full border border-primary-100 flex items-center gap-1">
                                                <Zap className="w-2.5 h-2.5" />AI MATCH
                                            </span>
                                        )}
                                        {job.score > 0 && (
                                            <span className="text-[10px] font-black text-gray-400">{Math.round(job.score)}% match</span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="font-black text-gray-900 text-lg mb-1 group-hover:text-primary-600 transition-colors">{job.title}</h3>
                                {job.job_type && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">{job.job_type} · {job.location_type}</p>}
                                <div className="flex flex-wrap gap-1.5 mb-5">
                                    {job.skills_required?.split(',').slice(0, 4).map((s, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-lg border">{s.trim()}</span>
                                    ))}
                                </div>
                                {job.salary && <p className="text-xs text-emerald-600 font-bold mb-3">💰 {job.salary}</p>}
                                <button onClick={() => apply(job.id)} className="btn-primary w-full h-11 text-xs font-black">Quick Apply Now</button>
                            </div>
                        ))}
                        {filtered.length === 0 && !loading && (
                            <div className="col-span-full py-24 flex flex-col items-center text-gray-400">
                                <Briefcase className="w-16 h-16 mb-4 stroke-1" /><p className="font-bold">No jobs posted yet</p>
                            </div>
                        )}
                    </div>
                )}
        </div>
    );
};

// ── MY TESTS SECTION (New Automated Test System) ──────────────────
const AssessmentsTab = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/student/my-tests')
            .then(r => setTests(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const startTest = (test) => {
        // Request fullscreen for professional exam experience
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        navigate(`/test/proctored/${test.id}`, { state: { ...test, job_title: test.title, test_info: "AI Proctored Mode" } });
    };

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-2xl font-black text-gray-900">My Assigned Tests</h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-black opacity-60 italic">AI Proctoring Gateway • Real-time Monitoring</p>
                </div>
                <div className="px-5 py-2 bg-primary-100 text-primary-700 text-[10px] font-black rounded-xl border border-primary-200 uppercase tracking-widest">
                    {tests.length} Assigned Tests
                </div>
            </div>

            {loading ? <div className="py-20 text-center animate-pulse font-black text-primary-600">Checking for new assignments...</div>
                : tests.length === 0 ? (
                    <div className="py-32 flex flex-col items-center text-center bg-white rounded-[3rem] border border-gray-100 shadow-sm px-10">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                            <Target className="w-10 h-10 text-gray-300 stroke-1" />
                        </div>
                        <h4 className="text-lg font-black text-gray-900">No Tests Found</h4>
                        <p className="text-sm text-gray-400 mt-2 max-w-xs">Your teacher hasn't assigned any automated tests yet. Keep checking this portal.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tests.map(test => (
                            <div key={test.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
                                    <Zap className="w-40 h-40 -rotate-12" />
                                </div>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                        <Code className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-lg leading-tight">{test.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`w-2 h-2 rounded-full ${test.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                            <p className={`text-[10px] uppercase font-black tracking-widest ${test.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}`}>{test.status}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-indigo-400" />
                                            <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Duration</span>
                                        </div>
                                        <p className="text-xs font-black text-gray-900">{test.duration} Minutes</p>
                                    </div>

                                    {test.status === 'Completed' ? (
                                        <div className="space-y-3">
                                            {test.is_published ? (
                                                <>
                                                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Award className="w-4 h-4 text-emerald-500" />
                                                            <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Score</span>
                                                        </div>
                                                        <p className="text-xs font-black text-emerald-700">{test.score}% Verified</p>
                                                    </div>
                                                    {test.feedback && (
                                                        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Bot className="w-3.5 h-3.5 text-indigo-500" />
                                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Instructor Assessment</p>
                                                            </div>
                                                            <p className="text-[11px] text-indigo-800 font-medium leading-relaxed italic">"{test.feedback}"</p>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                                                    <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-[11px] text-amber-700 font-black uppercase tracking-widest leading-none mb-1">Review in Progress</p>
                                                        <p className="text-[10px] text-amber-600 font-medium">Your score is being verified by the instructor. You will be notified once announced.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3 p-4 bg-primary-50/50 rounded-2xl border border-primary-100">
                                            <AlertCircle className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-primary-700 font-medium leading-relaxed italic">
                                                Monitoring Mode: <strong>Full AI Proctoring</strong>. Right-click and tab-switching will be blocked.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {test.status === 'Pending' && (
                                    <button
                                        onClick={() => startTest(test)}
                                        className="w-full h-16 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                                    >
                                        Start Assessment <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
};


// ── APPLICATIONS TAB ────────────────────────────────────────────────────────
const ApplicationsTab = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/jobs/applications/my').then(r => setApps(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const SC = {
        applied: { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock },
        reviewing: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: RefreshCw },
        accepted: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle },
        rejected: { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle }
    };

    return (
        <div className="max-w-3xl space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-gray-900">My Applications</h3>
                <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-black rounded-full">{apps.length} Total</span>
            </div>
            {loading ? <div className="py-20 text-center text-primary-600 font-bold animate-pulse">Loading...</div>
                : apps.length === 0 ? (
                    <div className="py-24 flex flex-col items-center text-gray-400 bg-white rounded-3xl border border-gray-100">
                        <FileText className="w-16 h-16 mb-4 stroke-1" /><p className="font-bold">No applications yet — go to Jobs tab!</p>
                    </div>
                ) : apps.map(app => {
                    const cfg = SC[app.status] || SC.applied;
                    const Icon = cfg.icon;
                    const hasTest = app.status === 'accepted' && (app.test_date || app.test_time);

                    return (
                        <div key={app.id} className={`bg-white rounded-3xl p-6 border shadow-sm transition-all hover:shadow-md flex flex-col gap-5 ${hasTest ? 'border-primary-200 bg-gradient-to-br from-white to-primary-50/20' : 'border-gray-100'}`}>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl"><Briefcase className="w-5 h-5" /></div>
                                    <div>
                                        <p className="font-black text-gray-900">{app.job_title}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(app.applied_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black border ${cfg.color}`}>
                                    <Icon className="w-3 h-3" /> {app.status.toUpperCase()}
                                </span>
                            </div>

                            {app.reason && (
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Feedback</p>
                                    <p className="text-xs text-gray-700 font-medium leading-relaxed">{app.reason}</p>
                                </div>
                            )}

                            {hasTest && (
                                <div className="p-5 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20 animate-fade-in">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-black text-lg flex items-center gap-2">
                                                <Target className="w-5 h-5 text-indigo-200" />
                                                Assessment Scheduled! 🚀
                                            </h4>
                                            <p className="text-indigo-100 text-[11px] font-medium opacity-90">Please join 5 mins before the start time.</p>
                                        </div>
                                        <div className="bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-md">
                                            <p className="text-[9px] font-black text-indigo-100 uppercase">Test Link</p>
                                            <p className="text-xs font-black truncate max-w-[100px]">{app.test_info || 'AI Proctored'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                                            <p className="text-[9px] font-black text-indigo-200 uppercase tracking-wider">Date</p>
                                            <p className="text-sm font-black">{app.test_date}</p>
                                        </div>
                                        <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                                            <p className="text-[9px] font-black text-indigo-200 uppercase tracking-wider">Time (Slot)</p>
                                            <p className="text-sm font-black">{app.test_time}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/test/proctored/${app.id}`, { state: app })}
                                        className="w-full bg-white text-indigo-600 h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-lg active:scale-[0.98]">
                                        Join Live Proctored Test <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
        </div>
    );
};

// ── ANALYZER TAB (ML-based) ─────────────────────────────────────────────────
const AnalyzerTab = ({ resumeUploaded, setActiveTab }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const analyze = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/resumes/analyze');
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Analysis failed!');
        }
        setLoading(false);
    };

    useEffect(() => { if (resumeUploaded) analyze(); }, [resumeUploaded]);

    if (!resumeUploaded) return (
        <div className="max-w-xl py-20 flex flex-col items-center text-gray-400">
            <BarChart2 className="w-16 h-16 mb-4 stroke-1" />
            <p className="font-black text-gray-700 text-lg mb-2">Resume Not Uploaded</p>
            <p className="text-sm text-center mb-6">Upload your resume to get AI-powered analysis using Internal TF-IDF ML Engine</p>
            <button onClick={() => setActiveTab('resume')} className="btn-primary px-8 py-3 text-sm font-black">Upload Resume</button>
        </div>
    );

    return (
        <div className="max-w-2xl space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-gray-900">AI Resume Analyzer</h3>
                    {data?.source && <p className="text-xs text-primary-600 font-bold mt-1 flex items-center gap-1"><Zap className="w-3 h-3" />{data.source}</p>}
                </div>
                <button onClick={analyze} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-xs font-black border border-primary-100 hover:bg-primary-500 hover:text-white transition-all">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Re-Analyze
                </button>
            </div>

            {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-medium">{error}</div>}
            {loading && <div className="py-20 flex flex-col items-center text-primary-600 font-bold animate-pulse"><BarChart2 className="w-12 h-12 mb-3" />Running ML analysis on your resume...</div>}

            {data && !loading && (
                <div className="space-y-5">
                    {/* Score */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center gap-8">
                        <div className="relative w-28 h-28">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="10"
                                    strokeDasharray={`${2.51 * (data.match_percentage || 0)} 251`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-black text-gray-900">{data.match_percentage}%</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 text-xl mb-1">Skill Match Score</h4>
                            <p className="text-gray-500 text-sm">vs. all posted internal jobs</p>
                            <span className={`mt-3 inline-block px-4 py-1.5 rounded-full text-xs font-black ${data.match_percentage >= 70 ? 'bg-emerald-100 text-emerald-700' : data.match_percentage >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                {data.match_percentage >= 70 ? 'Strong Match' : data.match_percentage >= 40 ? 'Good — Keep improving' : 'Needs Development'}
                            </span>
                        </div>
                    </div>

                    {/* Detected Skills */}
                    {data.resume_skills?.length > 0 && (
                        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                            <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-500" />Detected Skills in Your Resume</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.resume_skills.map((s, i) => <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 capitalize">{s}</span>)}
                            </div>
                        </div>
                    )}

                    {/* Missing Skills */}
                    {data.missing_skills?.length > 0 && (
                        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                            <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-rose-500" />Missing Skills (vs. Job Requirements)</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.missing_skills.map((s, i) => <span key={i} className="px-4 py-2 bg-rose-50 text-rose-700 text-sm font-bold rounded-xl border border-rose-100 capitalize">{s}</span>)}
                            </div>
                        </div>
                    )}

                    {/* ML Job Recommendations */}
                    {data.recommended_jobs?.length > 0 && (
                        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                            <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-primary-500" />Jobs Matched via Internal API
                                <span className="text-[10px] bg-primary-50 text-primary-600 px-2 py-1 rounded-full font-black border border-primary-100">TF-IDF ML Engine</span>
                            </h4>
                            <div className="space-y-3">
                                {data.recommended_jobs.map((j, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-primary-50 rounded-2xl border border-primary-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary-500 text-white rounded-xl flex items-center justify-center font-black text-sm">{i + 1}</div>
                                            <span className="font-bold text-gray-900">{j.title}</span>
                                        </div>
                                        <span className="text-sm font-black text-primary-600 bg-white px-3 py-1 rounded-xl border border-primary-100">{j.score.toFixed(1)}% match</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ── COURSES TAB (Based on missing skills from resume) ───────────────────────
const CoursesTab = ({ resumeUploaded, setActiveTab }) => {
    const trackingKey = 'course_tracking';
    const [tracking, setTracking] = useState(() => JSON.parse(localStorage.getItem(trackingKey) || '{}'));
    const [courses, setCourses] = useState([]);
    const [source, setSource] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!resumeUploaded) return;
        const load = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/resumes/analyze');
                if (data.courses?.length > 0) {
                    setCourses(data.courses);
                    setSource('Based on missing skills from your resume — Internal API');
                }
            } catch { /* no-op */ }
            setLoading(false);
        };
        load();
    }, [resumeUploaded]);

    // Default courses if no resume
    const defaultCourses = [
        { name: 'Python for Data Science', link: 'https://www.udemy.com/course/python-for-data-science/', tag: 'Udemy' },
        { name: 'Full Stack React + FastAPI', link: 'https://www.youtube.com/results?search_query=fastapi+react', tag: 'YouTube' },
        { name: 'Machine Learning A-Z', link: 'https://www.udemy.com/course/machinelearning/', tag: 'Udemy' },
        { name: 'Docker & Kubernetes', link: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/', tag: 'Udemy' },
        { name: 'Git & GitHub Mastery', link: 'https://www.youtube.com/watch?v=RGOj5yH7evk', tag: 'YouTube' },
        { name: 'PostgreSQL for Beginners', link: 'https://www.youtube.com/watch?v=qw--VYLpxG4', tag: 'YouTube' },
    ];

    const displayCourses = courses.length > 0 ? courses : defaultCourses;
    const displaySource = source || (resumeUploaded ? '' : 'General recommendations — Upload resume for personalized courses');

    const setStatus = (name, status) => {
        const updated = { ...tracking, [name]: status };
        setTracking(updated);
        localStorage.setItem(trackingKey, JSON.stringify(updated));
    };

    const tagColor = { Udemy: 'bg-orange-50 text-orange-700', YouTube: 'bg-rose-50 text-rose-700', Coursera: 'bg-blue-50 text-blue-700', Docs: 'bg-gray-50 text-gray-700' };
    const statusBadge = { 'started': 'bg-blue-100 text-blue-700', 'in-progress': 'bg-amber-100 text-amber-700', 'completed': 'bg-emerald-100 text-emerald-700' };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h3 className="text-xl font-black text-gray-900">Learning Recommendations</h3>
                    {displaySource && (
                        <p className="text-xs mt-1 flex items-center gap-1.5 text-primary-600 font-bold">
                            <Zap className="w-3.5 h-3.5" />{displaySource}
                        </p>
                    )}
                </div>
                {!resumeUploaded && (
                    <button onClick={() => setActiveTab('resume')} className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-xs font-black border border-primary-100 hover:bg-primary-500 hover:text-white transition-all">
                        Upload Resume for Personalized Courses
                    </button>
                )}
            </div>

            {loading && <div className="py-10 text-center text-primary-600 font-bold animate-pulse">Analyzing resume for course suggestions...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {displayCourses.map((c, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${tagColor[c.tag] || 'bg-gray-50 text-gray-600'}`}>{c.tag}</span>
                                <h4 className="font-black text-gray-900 mt-2 text-sm leading-snug">{c.name}</h4>
                            </div>
                            <a href={c.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-500 hover:text-white transition-all ml-2">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                        <div className="flex gap-1.5 mt-3">
                            {['started', 'in-progress', 'completed'].map(s => (
                                <button key={s} onClick={() => setStatus(c.name, s === tracking[c.name] ? null : s)}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${tracking[c.name] === s ? statusBadge[s] + ' border-current' : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'}`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentDashboard;
