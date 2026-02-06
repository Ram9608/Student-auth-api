
import { useState, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, List, Users, Download, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Job {
    id: number;
    title: string;
    description: string;
    company: string;
    location: string;
    required_skills: string[];
    experience_level: string;
    created_at: string;
}

interface Application {
    id: number;
    status: string;
    applied_at: string;
    student_name: string;
    student_email: string;
    resume_path: string | null;
}

const TeacherDashboard = () => {
    const [activeTab, setActiveTab] = useState('my_jobs');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loadingApps, setLoadingApps] = useState(false);

    // Job Form State
    const [jobForm, setJobForm] = useState({
        title: '',
        description: '',
        company: '',
        location: '',
        required_skills: '',
        experience_level: ''
    });

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        try {
            const res = await api.get('/teacher/jobs');
            setJobs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchApplications = async (job: Job) => {
        setSelectedJob(job);
        setLoadingApps(true);
        setActiveTab('view_applications');
        try {
            const res = await api.get(`/teacher/jobs/${job.id}/applications`);
            setApplications(res.data);
        } catch (err) {
            toast.error('Failed to fetch applications');
            setActiveTab('my_jobs');
        } finally {
            setLoadingApps(false);
        }
    };

    const handlePostJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...jobForm,
                required_skills: jobForm.required_skills.split(',').map(s => s.trim()).filter(s => s)
            };
            await api.post('/teacher/jobs', payload);
            toast.success('Job posted successfully!');
            setJobForm({ title: '', description: '', company: '', location: '', required_skills: '', experience_level: '' });
            setActiveTab('my_jobs');
            fetchMyJobs();
        } catch (err) {
            toast.error('Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId: number, newStatus: string) => {
        let reason = "";
        if (newStatus === 'rejected') {
            const userReason = window.prompt("Enter rejection reason (or leave blank for AI generated):");
            if (userReason === null) return; // User cancelled
            reason = userReason;
        }

        try {
            await api.patch(`/teacher/applications/${applicationId}/status?status=${newStatus}&reason=${encodeURIComponent(reason)}`);
            toast.success(`Application ${newStatus} successfully!`);
            // Refresh applications list
            if (selectedJob) {
                fetchApplications(selectedJob);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.detail || `Failed to ${newStatus} application`);
        }
    };

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <h1>Instructor Dashboard</h1>
                <p>Post jobs and manage your student applications.</p>
            </div>

            <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${activeTab === 'post_job' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setActiveTab('post_job'); setSelectedJob(null); }}
                >
                    <PlusCircle size={18} /> Post a Job
                </button>
                <button
                    className={`btn ${activeTab === 'my_jobs' || activeTab === 'view_applications' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setActiveTab('my_jobs'); setSelectedJob(null); }}
                >
                    <List size={18} /> My Jobs
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'post_job' && (
                    <motion.div key="post" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-panel">
                        <h2>Post a New Opportunity</h2>
                        <form onSubmit={handlePostJob} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Job Title</label>
                                <input
                                    type="text"
                                    className="glass-input"
                                    placeholder="e.g. Junior Python Developer"
                                    value={jobForm.title}
                                    onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Company Name</label>
                                <input
                                    type="text"
                                    className="glass-input"
                                    placeholder="Tech Corp"
                                    value={jobForm.company}
                                    onChange={e => setJobForm({ ...jobForm, company: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="glass-input"
                                    placeholder="Remote / New York"
                                    value={jobForm.location}
                                    onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Experience Level</label>
                                <select
                                    className="input-field"
                                    style={{ width: '100%', padding: '12px' }}
                                    value={jobForm.experience_level}
                                    onChange={e => setJobForm({ ...jobForm, experience_level: e.target.value })}
                                    required
                                >
                                    <option value="">Select Level</option>
                                    <option value="Fresher">Fresher</option>
                                    <option value="1-3 Years">1-3 Years</option>
                                    <option value="3-5 Years">3-5 Years</option>
                                    <option value="5+ Years">5+ Years</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Required Skills (comma separated)</label>
                                <input
                                    type="text"
                                    className="glass-input"
                                    placeholder="Python, SQL, AWS..."
                                    value={jobForm.required_skills}
                                    onChange={e => setJobForm({ ...jobForm, required_skills: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Job Description</label>
                                <textarea
                                    className="glass-input"
                                    rows={5}
                                    value={jobForm.description}
                                    onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <button className="btn btn-primary" type="submit" disabled={loading}>
                                    {loading ? 'Posting...' : 'Post Job'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {activeTab === 'my_jobs' && (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'grid', gap: '1.5rem' }}>
                        {jobs.length === 0 ? (
                            <div className="glass-panel text-center">
                                <p>You haven't posted any jobs yet.</p>
                            </div>
                        ) : (
                            jobs.map(job => (
                                <motion.div
                                    key={job.id}
                                    className="glass-panel"
                                    whileHover={{ y: -2 }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 0.5rem 0' }}>{job.title}</h3>
                                            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{job.company} • {job.location}</p>
                                        </div>
                                        <button className="btn btn-secondary" onClick={() => fetchApplications(job)} style={{ fontSize: '0.85rem' }}>
                                            <Users size={16} /> View Applications
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
                                        {job.required_skills.map((skill, i) => (
                                            <span key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}

                {activeTab === 'view_applications' && (
                    <motion.div key="apps" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-panel">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => setActiveTab('my_jobs')}>
                                <ArrowLeft size={18} />
                            </button>
                            <h2 style={{ margin: 0 }}>Applications for {selectedJob?.title}</h2>
                        </div>

                        {loadingApps ? (
                            <div className="text-center" style={{ padding: '3rem' }}><div className="spinner"></div></div>
                        ) : applications.length === 0 ? (
                            <div className="text-center" style={{ padding: '3rem', color: 'var(--text-secondary)' }}>
                                <p>No applications received for this job yet.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ borderBottom: '1px solid var(--card-border)' }}>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '12px' }}>Student Name</th>
                                            <th style={{ textAlign: 'left', padding: '12px' }}>Email</th>
                                            <th style={{ textAlign: 'left', padding: '12px' }}>Applied Date</th>
                                            <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                                            <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map(app => (
                                            <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '12px' }}>{app.student_name}</td>
                                                <td style={{ padding: '12px' }}>{app.student_email}</td>
                                                <td style={{ padding: '12px' }}>{new Date(app.applied_at).toLocaleDateString()}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        background:
                                                            app.status === 'shortlisted' ? 'rgba(16, 185, 129, 0.2)' :
                                                                app.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' :
                                                                    app.status === 'viewed' ? 'rgba(59, 130, 246, 0.2)' :
                                                                        'rgba(251, 191, 36, 0.2)',
                                                        color:
                                                            app.status === 'shortlisted' ? '#10b981' :
                                                                app.status === 'rejected' ? '#ef4444' :
                                                                    app.status === 'viewed' ? '#3b82f6' :
                                                                        '#fbbf24'
                                                    }}>
                                                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                    {app.resume_path && (
                                                        <a
                                                            href={`http://127.0.0.1:8000${app.resume_path}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="btn btn-secondary"
                                                            style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                                                        >
                                                            <Download size={14} /> Resume
                                                        </a>
                                                    )}
                                                    {app.status !== 'shortlisted' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'shortlisted')}
                                                            className="btn"
                                                            style={{
                                                                fontSize: '0.75rem',
                                                                padding: '6px 10px',
                                                                background: 'rgba(16, 185, 129, 0.2)',
                                                                color: '#10b981',
                                                                border: '1px solid rgba(16, 185, 129, 0.3)'
                                                            }}
                                                        >
                                                            <CheckCircle size={14} /> Shortlist
                                                        </button>
                                                    )}
                                                    {app.status !== 'rejected' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                                            className="btn"
                                                            style={{
                                                                fontSize: '0.75rem',
                                                                padding: '6px 10px',
                                                                background: 'rgba(239, 68, 68, 0.2)',
                                                                color: '#ef4444',
                                                                border: '1px solid rgba(239, 68, 68, 0.3)'
                                                            }}
                                                        >
                                                            <XCircle size={14} /> Reject
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeacherDashboard;
