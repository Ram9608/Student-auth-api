import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Briefcase, FileText, Bot, PieChart, Star, LogOut, Target, UserCheck, CheckCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// 📂 Premium Sidebar Navigation (Final Phase 13)
// Support: Dynamic Role Specific Menus (Student / Teacher).

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Reusable Nav Item Component with active states logic.
    const MenuItem = ({ to, icon: Icon, label }) => {
        // Correctly handle active state for paths with query params (tabs)
        const isActive = location.pathname + location.search === to
            || (to === "/dashboard/student" && location.pathname === "/dashboard/student" && !location.search)
            || (to === "/dashboard/teacher" && location.pathname === "/dashboard/teacher" && !location.search);

        return (
            <NavLink
                to={to}
                className={`
                    flex items-center gap-4 px-6 py-4 transition-all duration-300 rounded-2xl group relative
                    ${isActive
                        ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-xl shadow-primary-500/20 font-black'
                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                    }
                `}
            >
                <Icon className="w-6 h-6 group-hover:scale-110 transition-transform stroke-[2]" />
                <span className="text-[11px] font-black uppercase tracking-widest leading-none truncate">{label}</span>

                {/* Active Indicator for extra premium look */}
                {isActive && (
                    <div className="absolute left-0 w-1.5 h-8 bg-white rounded-r-full shadow-lg shadow-white/50 animate-pulse"></div>
                )}
            </NavLink>
        );
    };

    // STUDENT NAVIGATION HUB
    const studentMenu = [
        { to: "/dashboard/student", icon: Home, label: "Control Center" },
        { to: "/jobs", icon: Briefcase, label: "Career Opportunities" },
        { to: "/dashboard/student?tab=applications", icon: CheckCircle, label: "My Applications" },
        { to: "/dashboard/student?tab=assessments", icon: Target, label: "Proctoring Portal" },
        { to: "/resume-analyzer", icon: PieChart, label: "Match Analytics" },
        { to: "/ai-chatbot", icon: Bot, label: "AI Career Assistant" },
        { to: "/face-register", icon: UserCheck, label: "Identity Setup" },
    ];

    // TEACHER NAVIGATION HUB
    const teacherMenu = [
        { to: "/dashboard/teacher", icon: Home, label: "Instructor Hub" },
        { to: "/dashboard/teacher?tab=jobs", icon: Star, label: "Manage Roles" },
        { to: "/dashboard/teacher?tab=applications", icon: FileText, label: "Review Center" },
        { to: "/dashboard/teacher?tab=facelock", icon: UserCheck, label: "Security Guard" },
        { to: "/face-register", icon: UserPlus, label: "Biometric Setup" },
    ];

    const currentMenu = user?.role === 'teacher' ? teacherMenu : studentMenu;

    return (
        <aside className="w-80 h-screen sticky top-0 bg-white border-r border-gray-100 p-8 flex flex-col transition-all duration-500 shadow-2xl shadow-gray-200/50 z-50">
            {/* Branding Header (Premium Glow) */}
            <div className="flex items-center gap-4 px-4 mb-16 group cursor-pointer">
                <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-indigo-700 to-indigo-900 flex items-center justify-center text-white font-black text-2xl shadow-2xl border border-white/20 group-hover:rotate-12 transition-transform shadow-indigo-500/20">
                    C
                </div>
                <div>
                    <h1 className="text-xl font-black font-outfit text-gray-900 tracking-tighter">CampusDice<span className="text-indigo-600">.ai</span></h1>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Smart Assessment Hub</p>
                </div>
            </div>

            {/* Main Dynamic Menu Section */}
            <nav className="flex-1 space-y-3">
                <div className="px-6 text-[10px] font-black text-gray-300 uppercase tracking-widest mb-6 opacity-60">System Navigation</div>
                {currentMenu.map((item, idx) => (
                    <MenuItem key={idx} {...item} />
                ))}
            </nav>

            {/* Footer Profile & Logout (Glass Section) */}
            <div className="pt-8 border-t border-gray-50 mt-auto space-y-4">
                <div className="flex items-center gap-4 px-5 py-4 bg-gray-50/50 rounded-3xl border border-gray-50 group hover:bg-white hover:shadow-xl transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 border-4 border-white shadow-xl flex items-center justify-center font-black text-gray-600 uppercase text-lg group-hover:scale-110 transition-transform">
                        {user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tighter">{user?.full_name}</p>
                        <p className="text-[9px] text-indigo-500 font-black uppercase tracking-[0.2em]">{user?.role} Profile</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-4 px-8 py-5 w-full rounded-2xl text-rose-500 hover:bg-rose-50 hover:shadow-xl hover:shadow-rose-100 transition-all font-black text-xs uppercase tracking-widest active:scale-95 border border-transparent hover:border-rose-100"
                >
                    <LogOut className="w-5 h-5 " />
                    <span>Exit Platform</span>
                </button>
            </div>

            <p className="mt-6 text-[8px] text-gray-300 text-center font-bold tracking-[0.4em] uppercase opacity-40">CampusDice.ai &middot; 2026</p>
        </aside>
    );
};

export default Sidebar;
