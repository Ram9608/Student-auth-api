
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, BookOpen, Star, MapPin, Github, Linkedin, Upload, Plus, Trash2, Globe, DollarSign, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    description: string;
    required_skills: string[];
    experience_level: string;
    created_at: string;
}

interface AnalysisResult {
    match_score: number;
    matched_skills: string[];
    missing_skills: string[];
    explanation: string;
    ai_improvement_suggestions: string[];
    recommended_courses: { skill: string; course_name: string; platform: string; course_url: string; level: string; language: string }[];
}

const StudentDashboard = () => {
    // ... (rest of the file remains unchanged until render)

    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('recommendations');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);

    // Analysis State
    const [analyzingJobId, setAnalyzingJobId] = useState<number | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    // Profile Form State
    const [profileForm, setProfileForm] = useState<any>({
        age: '',
        education: '',
        skills: '',
        preferred_job_role: '',
        experience_level: '',
        city_state: '',
        github_link: '',
        linkedin_link: '',
        fresher_status: 'Fresher',
        availability: '',
        work_authorization: 'Indian Citizen',
        expected_salary: '',
        education_details: [],
        projects: [],
        experience_details: [],
        resume_path: ''
    });

    useEffect(() => {
        fetchProfile();
        fetchRecommendedJobs();
        fetchAllJobs();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/student/profile');
            if (res.data) {
                setProfile(res.data);
                setProfileForm({
                    age: res.data.age || '',
                    education: res.data.education || '',
                    skills: res.data.skills ? res.data.skills.join(', ') : '',
                    preferred_job_role: res.data.preferred_job_role || '',
                    experience_level: res.data.experience_level || '',
                    city_state: res.data.city_state || '',
                    github_link: res.data.github_link || '',
                    linkedin_link: res.data.linkedin_link || '',
                    fresher_status: res.data.fresher_status || 'Fresher',
                    availability: res.data.availability || '',
                    work_authorization: res.data.work_authorization || 'Indian Citizen',
                    expected_salary: res.data.expected_salary || '',
                    education_details: res.data.education_details || [],
                    projects: res.data.projects || [],
                    experience_details: res.data.experience_details || [],
                    resume_path: res.data.resume_path || ''
                });
            }
        } catch (err) {
            console.log("No profile yet");
        }
    };

    const fetchRecommendedJobs = async () => {
        try {
            const res = await api.get('/jobs/recommendations');
            setRecommendedJobs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAllJobs = async () => {
        try {
            const res = await api.get('/jobs');
            setJobs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...profileForm,
                age: profileForm.age ? parseInt(profileForm.age) : null,
                skills: profileForm.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
            };
            await api.put('/student/profile', payload);
            toast.success('Profile updated successfully!');
            fetchProfile();
            fetchRecommendedJobs();
        } catch (err) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploadingResume(true);
        try {
            const res = await api.post('/student/resume', formData);
            toast.success('Resume uploaded successfully!');

            // 🚀 Immediate Sync: Update both profile and profileForm states
            if (res.data && res.data.resume_path) {
                setProfile(prev => prev ? { ...prev, resume_path: res.data.resume_path } : { resume_path: res.data.resume_path });
                setProfileForm(prev => ({ ...prev, resume_path: res.data.resume_path }));
            }

            fetchProfile();
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || 'Failed to upload resume';
            toast.error(errorMsg);
            console.error('Upload Error:', err);
        } finally {
            setUploadingResume(false);
        }
    };

    const handleAnalyzeFit = async (jobId: number) => {
        setAnalyzingJobId(jobId);
        try {
            const res = await api.post(`/resume-analyzer/analyze/${jobId}`);
            setAnalysisResult(res.data);
            setShowAnalysisModal(true);
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Analysis failed");
        } finally {
            setAnalyzingJobId(null);
        }
    };

    const addListItem = (field: string, defaultValue: any) => {
        setProfileForm({
            ...profileForm,
            [field]: [...profileForm[field], defaultValue]
        });
    };

    const removeListItem = (field: string, index: number) => {
        const newList = [...profileForm[field]];
        newList.splice(index, 1);
        setProfileForm({ ...profileForm, [field]: newList });
    };

    const updateListItem = (field: string, index: number, subField: string, value: string) => {
        const newList = [...profileForm[field]];
        newList[index] = { ...newList[index], [subField]: value };
        setProfileForm({ ...profileForm, [field]: newList });
    };

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <h1>Welcome, {user?.first_name}</h1>
                <p>Find your dream job with AI-powered recommendations.</p>
            </div>

            <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${activeTab === 'recommendations' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('recommendations')}
                >
                    <Star size={18} /> For You
                </button>
                <button
                    className={`btn ${activeTab === 'all_jobs' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('all_jobs')}
                >
                    <Briefcase size={18} /> All Jobs
                </button>
                <button
                    className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <User size={18} /> My Profile
                </button>
            </div>

            {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="profile-container">
                    <form onSubmit={handleProfileUpdate}>
                        {/* Section: Basic Information */}
                        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
                                <User className="text-primary" size={24} />
                                <h2 style={{ margin: 0 }}>Basic Information</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Email ID</label>
                                    <input type="text" className="glass-input" value={user?.email || ''} disabled style={{ opacity: 0.7 }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input type="text" className="glass-input" value={user?.phone || ''} disabled style={{ opacity: 0.7 }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <input
                                        type="number"
                                        className="glass-input"
                                        value={profileForm.age}
                                        onChange={e => setProfileForm({ ...profileForm, age: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="input-field"
                                        style={{ width: '100%', padding: '12px' }}
                                        value={profileForm.fresher_status}
                                        onChange={e => setProfileForm({ ...profileForm, fresher_status: e.target.value })}
                                    >
                                        <option value="Fresher">Fresher</option>
                                        <option value="Experienced">Experienced</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Current City & State</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} size={18} />
                                        <input
                                            type="text"
                                            className="glass-input"
                                            style={{ paddingLeft: '40px' }}
                                            placeholder="e.g. Mumbai, Maharashtra"
                                            value={profileForm.city_state}
                                            onChange={e => setProfileForm({ ...profileForm, city_state: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Resume Upload */}
                        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
                                <Upload className="text-primary" size={24} />
                                <h2 style={{ margin: 0 }}>Resume / CV</h2>
                            </div>
                            <div className="text-center" style={{ padding: '1rem' }}>
                                {profileForm.resume_path ? (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ color: 'var(--success)', fontWeight: 600 }}>✅ Resume Uploaded</p>
                                        <a
                                            href={`http://127.0.0.1:8000${profileForm.resume_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.85rem' }}
                                        >
                                            View Current Resume
                                        </a>
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No resume uploaded yet (PDF only)</p>
                                )}
                                <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Upload size={18} />
                                    {uploadingResume ? 'Uploading...' : 'Upload New Resume'}
                                    <input type="file" accept=".pdf" hidden onChange={handleResumeUpload} disabled={uploadingResume} />
                                </label>
                            </div>
                        </div>

                        {/* Section: Professional Links */}
                        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
                                <Globe className="text-primary" size={24} />
                                <h2 style={{ margin: 0 }}>Social & Professional Links</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="form-label">GitHub Profile</label>
                                    <div style={{ position: 'relative' }}>
                                        <Github style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} size={18} />
                                        <input
                                            type="url"
                                            className="glass-input"
                                            style={{ paddingLeft: '40px' }}
                                            placeholder="https://github.com/username"
                                            value={profileForm.github_link}
                                            onChange={e => setProfileForm({ ...profileForm, github_link: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">LinkedIn Profile</label>
                                    <div style={{ position: 'relative' }}>
                                        <Linkedin style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} size={18} />
                                        <input
                                            type="url"
                                            className="glass-input"
                                            style={{ paddingLeft: '40px' }}
                                            placeholder="https://linkedin.com/in/username"
                                            value={profileForm.linkedin_link}
                                            onChange={e => setProfileForm({ ...profileForm, linkedin_link: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Job Preferences */}
                        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
                                <Briefcase className="text-primary" size={24} />
                                <h2 style={{ margin: 0 }}>Job Preferences</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Preferred Job Role</label>
                                    <input
                                        type="text"
                                        className="glass-input"
                                        placeholder="e.g. Full Stack Developer"
                                        value={profileForm.preferred_job_role}
                                        onChange={e => setProfileForm({ ...profileForm, preferred_job_role: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Experience Level</label>
                                    <select
                                        className="input-field"
                                        style={{ width: '100%', padding: '12px' }}
                                        value={profileForm.experience_level}
                                        onChange={e => setProfileForm({ ...profileForm, experience_level: e.target.value })}
                                    >
                                        <option value="">Select Level</option>
                                        <option value="Fresher">Fresher (0 years)</option>
                                        <option value="Junior">Junior (1-3 years)</option>
                                        <option value="Mid">Mid Level (3-5 years)</option>
                                        <option value="Senior">Senior (5+ years)</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Skills (comma separated)</label>
                                    <input
                                        type="text"
                                        className="glass-input"
                                        placeholder="React, Node.js, Python, AWS..."
                                        value={profileForm.skills}
                                        onChange={e => setProfileForm({ ...profileForm, skills: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Availability / Joining Timeline</label>
                                    <input
                                        type="text"
                                        className="glass-input"
                                        placeholder="e.g. Immediate, 1 Month"
                                        value={profileForm.availability}
                                        onChange={e => setProfileForm({ ...profileForm, availability: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Expected Salary (Optional)</label>
                                    <div style={{ position: 'relative' }}>
                                        <DollarSign style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} size={18} />
                                        <input
                                            type="text"
                                            className="glass-input"
                                            style={{ paddingLeft: '40px' }}
                                            placeholder="e.g. 8-10 LPA"
                                            value={profileForm.expected_salary}
                                            onChange={e => setProfileForm({ ...profileForm, expected_salary: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Work Authorization</label>
                                    <input
                                        type="text"
                                        className="glass-input"
                                        value={profileForm.work_authorization}
                                        onChange={e => setProfileForm({ ...profileForm, work_authorization: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Education Details (Dynamic List) */}
                        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <BookOpen className="text-primary" size={24} />
                                    <h2 style={{ margin: 0 }}>Education</h2>
                                </div>
                                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => addListItem('education_details', { degree: '', institute: '', passing_year: '' })}>
                                    <Plus size={16} /> Add Education
                                </button>
                            </div>
                            {profileForm.education_details.map((edu: any, index: number) => (
                                <div key={index} className="list-item-form" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--card-border)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 40px', gap: '1rem' }}>
                                        <input type="text" placeholder="Degree (e.g. B.Tech)" className="glass-input" value={edu.degree} onChange={e => updateListItem('education_details', index, 'degree', e.target.value)} />
                                        <input type="text" placeholder="College / University" className="glass-input" value={edu.institute} onChange={e => updateListItem('education_details', index, 'institute', e.target.value)} />
                                        <input type="text" placeholder="Year" className="glass-input" value={edu.passing_year} onChange={e => updateListItem('education_details', index, 'passing_year', e.target.value)} />
                                        <button type="button" onClick={() => removeListItem('education_details', index)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Section: Projects (Dynamic List) */}
                        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <Star className="text-primary" size={24} />
                                    <h2 style={{ margin: 0 }}>Projects</h2>
                                </div>
                                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => addListItem('projects', { title: '', description: '', link: '' })}>
                                    <Plus size={16} /> Add Project
                                </button>
                            </div>
                            {profileForm.projects.map((proj: any, index: number) => (
                                <div key={index} className="list-item-form" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--card-border)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <input type="text" placeholder="Project Title" className="glass-input" value={proj.title} onChange={e => updateListItem('projects', index, 'title', e.target.value)} />
                                        <input type="url" placeholder="Project Link (GitHub/Demo)" className="glass-input" value={proj.link} onChange={e => updateListItem('projects', index, 'link', e.target.value)} />
                                        <button type="button" onClick={() => removeListItem('projects', index)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <textarea placeholder="Brief Description" className="glass-input" rows={2} value={proj.description} onChange={e => updateListItem('projects', index, 'description', e.target.value)} />
                                </div>
                            ))}
                        </div>

                        {/* Section: Internships / Training (Dynamic List) */}
                        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <BookOpen className="text-primary" size={24} />
                                    <h2 style={{ margin: 0 }}>Internships / Training</h2>
                                </div>
                                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => addListItem('experience_details', { company: '', role: '', duration: '' })}>
                                    <Plus size={16} /> Add Experience
                                </button>
                            </div>
                            {profileForm.experience_details.map((exp: any, index: number) => (
                                <div key={index} className="list-item-form" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--card-border)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem' }}>
                                        <input type="text" placeholder="Company / Institute" className="glass-input" value={exp.company} onChange={e => updateListItem('experience_details', index, 'company', e.target.value)} />
                                        <input type="text" placeholder="Role (e.g. Intern)" className="glass-input" value={exp.role} onChange={e => updateListItem('experience_details', index, 'role', e.target.value)} />
                                        <input type="text" placeholder="Duration (e.g. 6 Months)" className="glass-input" value={exp.duration} onChange={e => updateListItem('experience_details', index, 'duration', e.target.value)} />
                                        <button type="button" onClick={() => removeListItem('experience_details', index)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ position: 'sticky', bottom: '2rem', display: 'flex', justifyContent: 'flex-end', zIndex: 10 }}>
                            <button className="btn btn-primary" type="submit" disabled={loading} style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '1rem 3rem' }}>
                                {loading ? 'Saving Profile...' : 'Save Everything'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {activeTab === 'recommendations' && (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {recommendedJobs.length === 0 ? (
                        <div className="glass-panel text-center">
                            <h3>No recommendations yet?</h3>
                            <p>Update your skills in the profile tab to get matched with jobs!</p>
                        </div>
                    ) : (
                        recommendedJobs.map(job => (
                            <JobCard
                                key={job.id}
                                job={job}
                                recommended
                                onAnalyze={() => handleAnalyzeFit(job.id)}
                                analyzing={analyzingJobId === job.id}
                            />
                        ))
                    )}
                </div>
            )}

            {activeTab === 'all_jobs' && (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {jobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onAnalyze={() => handleAnalyzeFit(job.id)}
                            analyzing={analyzingJobId === job.id}
                        />
                    ))}
                </div>
            )}

            {/* Resume Analysis Modal */}
            <AnimatePresence>
                {showAnalysisModal && analysisResult && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}
                        onClick={() => setShowAnalysisModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass-panel"
                            style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', background: 'var(--background-dark)', border: '1px solid var(--primary-dark)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowAnalysisModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>

                            <div className="text-center" style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'inline-block', padding: '10px 20px', borderRadius: '50px', background: `conic-gradient(var(--primary) ${analysisResult.match_score}%, transparent 0)`, marginBottom: '1rem', border: '2px solid var(--card-border)' }}>
                                    <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{analysisResult.match_score}%</span>
                                </div>
                                <h2>Match Score</h2>
                                <p>{analysisResult.explanation}</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="glass-panel" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                                    <h3 style={{ color: '#4ade80', display: 'flex', items: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <CheckCircle size={18} /> Matched
                                    </h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {analysisResult.matched_skills.map((s, i) => (
                                            <span key={i} style={{ fontSize: '0.85rem', padding: '2px 8px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '4px' }}>{s}</span>
                                        ))}
                                        {analysisResult.matched_skills.length === 0 && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>None</span>}
                                    </div>
                                </div>
                                <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                                    <h3 style={{ color: '#f87171', display: 'flex', items: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <AlertCircle size={18} /> Missing
                                    </h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {analysisResult.missing_skills.map((s, i) => (
                                            <span key={i} style={{ fontSize: '0.85rem', padding: '2px 8px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '4px' }}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>💡 AI Improvement Tips</h3>
                                <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                                    {analysisResult.ai_improvement_suggestions.map((tip, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem' }}>{tip}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 style={{ marginBottom: '1rem' }}>📚 Recommended Actions</h3>
                                {analysisResult.recommended_courses.map((course, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{course.course_name}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>{course.platform}</span> •
                                                <span>{course.skill}</span> •
                                                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                                    {course.language}
                                                </span> •
                                                <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{course.level}</span>
                                            </div>
                                        </div>
                                        <a
                                            href={course.course_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.8rem', padding: '4px 10px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                                        >
                                            View
                                        </a>
                                    </div>
                                ))}
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const JobCard = ({ job, recommended, onAnalyze, analyzing }: { job: Job, recommended?: boolean, onAnalyze: () => void, analyzing: boolean }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
        style={{ position: 'relative', borderLeft: recommended ? '4px solid var(--primary)' : 'none' }}
    >
        {recommended && (
            <span style={{ position: 'absolute', top: 10, right: 10, background: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                Recommended
            </span>
        )}
        <h3>{job.title}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{job.company} • {job.location}</p>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
            {job.required_skills.map((skill, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    {skill}
                </span>
            ))}
        </div>

        <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{job.description}</p>

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Exp: {job.experience_level}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    onClick={onAnalyze}
                    disabled={analyzing}
                >
                    {analyzing ? <div className="spinner" style={{ width: 14, height: 14 }}></div> : <Star size={14} />}
                    {analyzing ? 'Analyzing...' : 'Analyze Fit'}
                </button>
                <button className="btn btn-primary" style={{ fontSize: '0.9rem' }}>Apply Now</button>
            </div>
        </div>
    </motion.div>
);

export default StudentDashboard;
