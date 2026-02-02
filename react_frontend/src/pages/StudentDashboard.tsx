
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { motion } from 'framer-motion';
import { User, Briefcase, BookOpen, Star, MapPin, Github, Linkedin, Upload, Plus, Trash2, Globe, DollarSign } from 'lucide-react';
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

const StudentDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('recommendations');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);

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
                            <JobCard key={job.id} job={job} recommended />
                        ))
                    )}
                </div>
            )}

            {activeTab === 'all_jobs' && (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            )}
        </div>
    );
};

const JobCard = ({ job, recommended }: { job: Job, recommended?: boolean }) => (
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
            <button className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>View Details</button>
        </div>
    </motion.div>
);

export default StudentDashboard;
