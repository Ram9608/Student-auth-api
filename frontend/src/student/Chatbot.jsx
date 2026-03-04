import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Send, Bot, User, Sparkles, MessageSquare, Terminal } from "lucide-react";
import { toast } from "react-toastify";

// 🤖 Student AI Chatbot (Phase 9 & 13)
// Logic: Real-time interaction with Groq AI using Resume/Job context.

const Chatbot = () => {
    const [msg, setMsg] = useState("");
    const [chat, setChat] = useState([
        { role: 'ai', text: 'Namaste! Main aapka Career AI assistant hoon. Resume ya Job recommendations ke baare me kuch bhi puchiye! 🚀' }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    // Auto scroll logic
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat]);

    const askAI = async (e) => {
        e.preventDefault();
        if (!msg.trim()) return;

        const userMsg = msg;
        setChat([...chat, { role: 'user', text: userMsg }]);
        setMsg("");
        setLoading(true);

        try {
            // Note: API endpoint /chatbot/ask
            const res = await api.post("/chatbot/ask", { question: userMsg });
            setChat(prev => [...prev, { role: 'ai', text: res.data.answer }]);
        } catch (err) {
            toast.error("AI thoda thak gaya hai, baad me try karein! ❌");
            setChat(prev => [...prev, { role: 'ai', text: "Galti ho gayi bhai! API connect nahi ho rahi." }]);
        }
        setLoading(false);
    };

    return (
        <div className="flex bg-gray-50/10 min-h-screen">
            <Sidebar />

            <main className="flex-1 flex flex-col h-screen">
                <Navbar role="student" />

                {/* Chat Container */}
                <div className="flex-1 overflow-hidden p-8 flex flex-col">
                    <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col relative overflow-hidden">

                        {/* Header Branding */}
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-xl z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-primary-600 rounded-[1.5rem] shadow-xl text-white">
                                    <Bot className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black font-outfit text-gray-900 tracking-tighter">Career AI GPT</h3>
                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div> Live Processing
                                    </p>
                                </div>
                            </div>
                            <Terminal className="text-gray-200" />
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide py-12">
                            {chat.map((c, i) => (
                                <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                    <div className={`flex gap-5 max-w-[80%] ${c.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:rotate-12 ${c.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-primary-600 text-white'}`}>
                                            {c.role === 'user' ? <User className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                                        </div>
                                        <div className={`p-8 rounded-[2rem] text-sm leading-relaxed font-medium shadow-sm border ${c.role === 'user' ? 'bg-indigo-50 border-indigo-100 text-indigo-900 rounded-tr-none' : 'bg-white border-gray-100 text-gray-800 rounded-tl-none'}`}>
                                            <p className="whitespace-pre-line">{c.text}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start animate-fade-in opacity-50">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center animate-bounce">
                                            <Bot className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl text-[10px] uppercase font-black tracking-widest italic text-gray-400">Thinking... 🧠</div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Footer */}
                        <div className="p-8 border-t border-gray-50 flex gap-4 bg-gray-50/20 backdrop-blur-md">
                            <form onSubmit={askAI} className="w-full flex gap-4 relative">
                                <input
                                    type="text"
                                    value={msg}
                                    onChange={e => setMsg(e.target.value)}
                                    className="input-field h-16 pl-8 pr-20 text-sm font-semibold shadow-inner border-transparent focus:border-primary-500 transition-all rounded-[1.5rem]"
                                    placeholder="Career ke baare me kuch bhi puchiye (e.g. 'How to improve my Python skills?')..."
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !msg.trim()}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-primary-600 text-white rounded-xl shadow-xl hover:bg-primary-700 active:scale-90 transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    <Send className="w-6 h-6" />
                                </button>
                            </form>
                        </div>
                    </div>

                    <p className="text-center text-[9px] text-gray-300 font-black uppercase tracking-[0.4em] pt-6 opacity-60 flex items-center justify-center gap-2">
                        <MessageSquare className="w-3 h-3" /> CareerAI Engine v2.0 - Secured with End-to-End Logic
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Chatbot;
