import React, { useState } from "react";
import api from "../api/axios";
import { PlusCircle, FileText, Briefcase, Zap } from "lucide-react";
import { toast } from "react-toastify";

// 📝 Post Job Component (Phase 13 Part 3)
// Dashboard ka ek widget jo Teachers ko nayi openings create karne deta hai.

const PostJob = () => {
    const [data, setData] = useState({ title: "", description: "", skills_required: "" });
    const [loading, setLoading] = useState(false);

    const submitJob = async (e) => {
        e.preventDefault();
        if (!data.title || !data.description || !data.skills_required) {
            return toast.warning("Sari fields bharna zaroori hai! ⚠️");
        }

        setLoading(true);
        try {
            // Note: Backend endpoint is /jobs/
            await api.post("/jobs/", data);
            toast.success("Job Posted Successfully ✅ Students can now see it!");
            setData({ title: "", description: "", skills_required: "" }); // Reset form
        } catch (err) {
            console.error(err);
            toast.error("Job posting fail ho gayi ❌");
        }
        setLoading(false);
    };

    return (
        <div className="glass p-10 rounded-[3rem] shadow-xl animate-fade-in border-white flex flex-col h-full">
            <h2 className="text-2xl font-black font-outfit text-gray-900 mb-8 flex items-center gap-3">
                <PlusCircle className="text-secondary-600" /> Post New Opportunity
            </h2>

            <form onSubmit={submitJob} className="space-y-6 flex-1">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Job Role Title</label>
                    <div className="relative group">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            placeholder="e.g. Senior Backend Developer"
                            className="input-field pl-12 h-14"
                            value={data.title}
                            onChange={(e) => setData({ ...data, title: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Detailed Description</label>
                    <textarea
                        placeholder="Job ke bare me puri jankari dein..."
                        className="input-field h-32 py-4 resize-none"
                        value={data.description}
                        onChange={(e) => setData({ ...data, description: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                        <span>Skills Required</span>
                        <span className="text-secondary-500 lowercase">(comma separated)</span>
                    </label>
                    <div className="relative group">
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-secondary-500 transition-colors" />
                        <input
                            placeholder="Python, Django, PostgreSQL, Docker"
                            className="input-field pl-12 h-14"
                            value={data.skills_required}
                            onChange={(e) => setData({ ...data, skills_required: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full h-14 mt-4 text-sm font-bold gap-3 shadow-xl shadow-primary-500/20"
                >
                    {loading ? 'Posting...' : <><PlusCircle className="w-5 h-5" /> Launch Job Posting</>}
                </button>
            </form>

            <p className="mt-6 text-[10px] text-gray-400 text-center uppercase font-bold tracking-[0.2em] opacity-60">
                AI will automatically match students with these skills
            </p>
        </div>
    );
};

export default PostJob;
