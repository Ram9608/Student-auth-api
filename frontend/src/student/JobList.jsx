import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Briefcase, MapPin, DollarSign, Sparkles, Search, Filter } from "lucide-react";
import { toast } from "react-toastify";

// 💼 Student Job List (Phase 13 Part 2)
// This implements both the listing and the 'Apply' logic for jobs.

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all jobs from the backend
        const fetchJobs = async () => {
            try {
                // Note: The backend endpoint is /jobs/
                const res = await api.get("/jobs/");
                setJobs(res.data);
            } catch (e) {
                console.error("Jobs load fail", e);
                toast.error("Error loading open jobs! ❌");
            }
            setLoading(false);
        };
        fetchJobs();
    }, []);

    const applyJob = async (id) => {
        try {
            // Note: Backend endpoint is /jobs/apply/{id}
            await api.post(`/jobs/apply/${id}`);
            toast.success("Applied successfully! ✅ Check status soon.");
        } catch (err) {
            console.error("Apply fail", err);
            toast.warning(err.response?.data?.detail || "Apply procedure failed ❌");
        }
    };

    const JobCard = ({ job }) => (
        <div className="glass p-8 rounded-[2.5rem] hover-card flex flex-col justify-between border-white shadow-xl relative group overflow-hidden">
            {/* Top section with icon and floating badge */}
            <div className="flex justify-between items-start mb-6">
                <div className="bg-primary-50 p-4 rounded-2xl text-primary-600 transition-all group-hover:bg-primary-500 group-hover:text-white group-hover:scale-110">
                    <Briefcase className="w-8 h-8" />
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-accent-emerald text-[10px] font-bold rounded-full uppercase tracking-widest border border-emerald-100 group-hover:bg-accent-emerald group-hover:text-white transition-all">
                    <Sparkles className="w-3 h-3" /> 92% Match
                </span>
            </div>

            <div className="mb-6 flex-1">
                <h3 className="text-xl font-bold font-outfit text-gray-900 mb-2 truncate group-hover:text-primary-600 transition-colors uppercase tracking-tight">{job.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed h-8">
                    {job.description}
                </p>
            </div>

            {/* Bottom meta info */}
            <div className="grid grid-cols-2 gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8 border-t border-gray-50 pt-5">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-400" /> Remote / Global</div>
                <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary-400" /> 12 - 18 LPA</div>
            </div>

            <button
                onClick={() => applyJob(job.id)}
                className="btn-primary w-full h-12 text-xs font-bold shadow-lg"
            >
                Quick Apply Now
            </button>
        </div>
    );

    return (
        <div className="animate-fade-in py-10">
            <header className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                <div>
                    <h2 className="text-4xl font-bold font-outfit text-gray-900 mb-2">Available Jobs</h2>
                    <p className="text-gray-500 leading-none">Find your perfect fit from curated <span className="text-primary-600 font-bold">Industry Openings</span>.</p>
                </div>

                {/* Search Bar inside JobList for better UX */}
                <div className="relative group w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500" />
                    <input type="text" placeholder="Search by title..." className="input-field pl-12 h-12 text-sm shadow-sm" />
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center p-20 text-primary-600 font-bold text-xl animate-pulse">
                    Scanning AI Matches...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {jobs.length > 0 ? jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    )) : (
                        <div className="col-span-full py-28 text-center glass rounded-[3rem] text-gray-400 flex flex-col items-center justify-center opacity-70">
                            <Briefcase className="w-20 h-20 mb-6 stroke-1" />
                            <p className="font-bold text-lg mb-2">No Open Jobs Found!</p>
                            <p className="text-sm max-w-[200px]">Teachers ne abhi tak koi job post nahi kari hai.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default JobList;
