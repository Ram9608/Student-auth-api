import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Search, Briefcase, MapPin, DollarSign, Filter, Sparkles } from 'lucide-react';
import API from '../api/axios';
import { toast } from 'react-toastify';

// 💼 Job List - Phase 13
// Design: Modern job cards, AI match badges, filters.

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await API.get('/jobs/list');
                setJobs(res.data);
            } catch (e) {
                toast.error("Jobs load nahi ho paaye!");
            }
            setLoading(false);
        };
        fetchJobs();
    }, []);

    const JobCard = ({ job }) => (
        <div className="glass p-8 rounded-3xl hover-card flex flex-col justify-between border-white shadow-xl relative group">
            <div className="flex justify-between items-start mb-6">
                <div className="bg-primary-50 p-4 rounded-2xl text-primary-600 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-8 h-8" />
                </div>
                {/* AI Match Notification */}
                <span className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20 blur-sm group-hover:blur-none transition-all">
                    <Sparkles className="w-3 h-3" /> 92% Match
                </span>
            </div>

            <div className="mb-6">
                <h3 className="text-xl font-bold font-outfit text-gray-900 mb-2 truncate">{job.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {job.description}
                </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 border-t border-gray-50 pt-6">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-400" /> Remote / India</div>
                <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary-400" /> 8 - 14 LPA</div>
            </div>

            <button className="btn-primary w-full h-12 text-sm font-bold shadow-lg">
                View & Apply Details
            </button>
        </div>
    );

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />

            <main className="flex-1 p-10 overflow-y-auto">
                <header className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-bold font-outfit text-gray-900 mb-2">Available Opportunities</h2>
                        <p className="text-lg text-gray-500">Discover jobs specifically matched to your unique <span className="text-primary-600 font-bold">AI Profile</span>.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="btn-secondary h-12 px-6 gap-2 text-sm font-semibold shadow-sm">
                            <Filter className="w-5 h-5" /> All Filters
                        </button>
                    </div>
                </header>

                <div className="relative mb-12">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 p-1.5 bg-primary-100 rounded-lg text-primary-600">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by title, skills, or location..."
                        className="input-field pl-16 h-16 shadow-xl text-lg font-medium"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center p-20 text-primary-600 font-bold text-xl animate-pulse">
                        Scanning Opportunities...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                        {jobs.length > 0 ? jobs.map(job => (
                            <JobCard key={job.id} job={job} />
                        )) : (
                            <div className="col-span-full py-20 text-center glass rounded-3xl text-gray-500 font-bold">
                                No jobs found. Check back later!
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default JobList;
