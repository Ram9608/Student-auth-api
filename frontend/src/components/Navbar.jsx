import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ⚓ Global Navbar (Phase 13 Part 2)
// This is the clean top bar that handles role display and Logout logic.

const Navbar = ({ role }) => {
    const { logout, user } = useAuth();
    // Use passed role or global user role from Context
    const currentRole = role || user?.role || 'Guest';
    const currentRoleLabel = currentRole === 'teacher' ? 'Instructor' : 'Student';

    return (
        <nav className="h-20 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-40 px-10 glass shadow-sm">
            {/* Left side: Branding */}
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600 shadow-sm border border-indigo-200">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                    <h1 className="text-xl font-black font-outfit text-gray-900 tracking-tight leading-none">
                        CampusDice.ai <span className="text-gray-400 mx-2">|</span> <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-4 decoration-4">{currentRoleLabel}</span>
                    </h1>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">AI-Powered Intelligent Assessment & Proctoring Platform</p>
                </div>
            </div>

            {/* Right side: Actions & User Profile */}
            <div className="flex items-center gap-6">
                <Link to="/system-status" className="p-2.5 text-gray-400 hover:text-emerald-600 transition-colors bg-gray-50 rounded-xl border border-gray-100 group">
                    <Search className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </Link>

                <button className="relative p-2.5 text-gray-400 hover:text-primary-600 transition-colors bg-gray-50 rounded-xl border border-gray-100 group">
                    <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                <div className="h-8 w-[1px] bg-gray-100 hidden sm:block"></div>

                <div className="flex items-center gap-4 group cursor-pointer p-1 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-gray-900 leading-none group-hover:text-primary-600 transition-colors uppercase tracking-tight">{user?.full_name}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Status: Online 🟢</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
                        {user?.full_name?.charAt(0)}
                    </div>
                </div>

                <div className="h-8 w-[1px] bg-gray-100"></div>

                {/* Main Logout Button as requested */}
                <button
                    onClick={logout}
                    className="flex items-center gap-2 p-3 px-6 bg-red-50 text-red-600 font-black text-xs uppercase tracking-[0.2em] rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-500/30 group active:scale-95"
                >
                    <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
