import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { PieChart, BookOpen, AlertTriangle, ExternalLink, Sparkles, Bot, GraduationCap } from "lucide-react";

// 📊 Resume AI Analyzer (Phase 13 Part 3)
// Logic: Fetch automated resume analysis + Skill Gaps + Courses recommendations.

const Analyzer = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                // Note: Backend endpoint is /resumes/analyze
                const res = await api.get("/resumes/analyze");
                setData(res.data);
            } catch (e) {
                console.error("Analysis Load Fail", e.response?.data?.detail);
            }
            setLoading(false);
        };
        fetchAnalysis();
    }, []);

    const CourseCard = ({ course }) => (
        <a
            href={course.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 bg-white border border-gray-100 rounded-3xl hover-card flex flex-col justify-between group h-full relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-secondary-50 text-secondary-600 rounded-xl group-hover:bg-secondary-600 group-hover:text-white transition-all shadow-sm">
                    <BookOpen className="w-5 h-5" />
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary-600 transition-colors" />
            </div>

            <div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight line-clamp-2">{course.name}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 italic">Partnered Course ✅</p>
            </div>
        </a>
    );

    return (
        <div className="flex bg-gray-50/10 min-h-screen">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen">
                <Navbar role="student" />

                <div className="p-10 space-y-12 overflow-y-auto">
                    <header className="mb-10 animate-fade-in flex justify-between items-end">
                        <div>
                            <h2 className="text-4xl font-black font-outfit text-gray-900 mb-2">Resume AI Analysis</h2>
                            <p className="text-gray-500 font-medium italic underline decoration-primary-200 decoration-4 underline-offset-4">Deep Learning driven skill-gap insight engine.</p>
                        </div>
                        <div className="p-3 bg-white shadow-xl rounded-2xl animate-pulse">
                            <Bot className="w-8 h-8 text-primary-600" />
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex justify-center p-40 text-primary-600 font-bold text-xl animate-pulse uppercase tracking-[0.4em]">
                            Scanning Profile...
                        </div>
                    ) : data ? (
                        <div className="space-y-12 animate-slide-up">
                            {/* Stats & Match Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="glass p-10 rounded-[3rem] shadow-xl flex items-center gap-8 border-white group relative overflow-hidden">
                                    <div className="p-5 bg-primary-600 text-white rounded-[2rem] shadow-xl shadow-primary-500/20 transition-all group-hover:scale-110">
                                        <PieChart className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Match Score</p>
                                        <p className="text-5xl font-black font-outfit text-gray-900 italic tracking-tighter">{data.match_percentage}%</p>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 glass p-10 rounded-[3rem] shadow-xl border-white relative overflow-hidden">
                                    <h3 className="text-xl font-black font-outfit text-gray-900 mb-6 flex items-center gap-3">
                                        <AlertTriangle className="text-accent-amber" /> Identified Skill Gaps
                                    </h3>
                                    <div className="flex flex-wrap gap-4">
                                        {data.missing_skills.length > 0 ? data.missing_skills.map((s) => (
                                            <span key={s} className="px-5 py-2.5 bg-rose-50 text-rose-500 text-xs font-black uppercase tracking-widest rounded-2xl border border-rose-100 animate-fade-in shadow-sm hover:bg-rose-500 hover:text-white transition-all cursor-default">
                                                MISSING: {s}
                                            </span>
                                        )) : (
                                            <p className="text-emerald-500 font-bold uppercase tracking-widest text-sm italic">Sari jaruri skills mojud hain! Well done. 🎯</p>
                                        )}
                                    </div>
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-rose-100 blur-[100px] rounded-full opacity-20"></div>
                                </div>
                            </div>

                            {/* Recommendations Grid */}
                            <div className="glass p-12 rounded-[4rem] shadow-2xl border-white relative">
                                <header className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-3xl font-black font-outfit text-gray-900 mb-2 flex items-center gap-3">
                                            <GraduationCap className="text-secondary-600" /> Recommended Courses
                                        </h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-4">Gaps ko fill karke career 🚀 karein!</p>
                                    </div>
                                    <Sparkles className="w-10 h-10 text-secondary-200" />
                                </header>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {data.courses.map((c, i) => (
                                        <CourseCard key={i} course={c} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-40 text-center glass rounded-[4rem] text-gray-400 group">
                            <Bot className="w-24 h-24 mb-6 mx-auto opacity-20 stroke-1 group-hover:scale-110 transition-transform" />
                            <p className="text-xl font-black uppercase tracking-[0.2em]">Bhai, pehle resume upload kar do!</p>
                            <p className="mt-2 font-medium italic">Logic: /resumes/analyze par data nahi mila.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Analyzer;
