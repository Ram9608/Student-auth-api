import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { Send, Bot, X, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "react-toastify";

const FloatingChatbot = ({ role = "student" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [msg, setMsg] = useState("");
    const [chat, setChat] = useState([
        {
            role: 'ai', text: role === 'teacher'
                ? 'Namaste! Main aapka AI Recruitment Assistant hoon. Hiring ya Screening me kaise madad karun? 👔'
                : 'Namaste! Main aapka Career AI assistant hoon. Kaise madad kar sakta hoon? 🚀'
        }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    // Role-based Professional Suggestions
    const studentSuggestions = [
        { text: "Resume Tips 📝", q: "Give me some quick, professional resume tips for my profile." },
        { text: "Interview Prep 🎤", q: "How should I prepare for a technical interview?" },
        { text: "Career Roadmap 🗺️", q: "Suggest a 3-month career roadmap based on my skills." },
        { text: "Skill Gap 🔍", q: "What are the most in-demand AI skills right now?" }
    ];

    const teacherSuggestions = [
        { text: "Draft a JD 📄", q: "Help me write a professional Job Description for a Full Stack Developer role." },
        { text: "Interview Qs 🎤", q: "Give me 5 tough interview questions for a Python Backend role." },
        { text: "Screening Tips 🔍", q: "What should I look for when screening resumes for AI Engineers?" },
        { text: "Hiring Trends 📈", q: "What are the latest hiring trends in the IT sector for 2026?" }
    ];

    // Auto scroll logic
    useEffect(() => {
        if (isOpen) {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chat, isOpen]);

    const askAI = async (e) => {
        e.preventDefault();
        if (!msg.trim()) return;

        const userMsg = msg;
        setChat([...chat, { role: 'user', text: userMsg }]);
        setMsg("");
        setLoading(true);

        try {
            const res = await api.post("/chatbot/ask", { question: userMsg });
            setChat(prev => [...prev, { role: 'ai', text: res.data.answer || res.data.reply || "AI Error" }]);
        } catch (err) {
            setChat(prev => [...prev, { role: 'ai', text: "Galti ho gayi bhai! Please try again later." }]);
        }
        setLoading(false);
    };

    const suggestions = role === 'teacher' ? teacherSuggestions : studentSuggestions;

    return (
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[400px] h-[550px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
                    {/* Header */}
                    <div className="p-6 bg-primary-600 text-white flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black tracking-tight">Career AI Assistant</h3>
                                <p className="text-[10px] text-primary-100 opacity-80 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Always Active · Groq LPU
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50/30 scrollbar-hide">
                        {chat.map((c, i) => (
                            <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-xs font-semibold leading-relaxed shadow-sm ${c.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    <p className="whitespace-pre-wrap">{c.text}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="p-3 bg-white border border-gray-100 rounded-2xl rounded-bl-none text-[10px] font-black text-gray-400 animate-pulse flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-primary-500" /> AI is thinking...
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>

                    {/* Suggestions Chips (NEW) */}
                    <div className="px-6 py-3 bg-white border-t border-gray-50 flex gap-2 overflow-x-auto scrollbar-hide">
                        {suggestions.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setMsg(s.q); }}
                                className="whitespace-nowrap px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1"
                            >
                                {s.text}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-6 bg-white border-t border-gray-50">
                        <form onSubmit={askAI} className="flex gap-2">
                            <input
                                value={msg}
                                onChange={e => setMsg(e.target.value)}
                                className="flex-1 bg-gray-50 border-none rounded-[1.2rem] px-5 py-3 text-xs font-semibold focus:ring-2 focus:ring-primary-500 outline-none shadow-inner"
                                placeholder="Kuch puchiye ya upar tap karein..."
                            />
                            <button type="submit" disabled={loading || !msg.trim()} className="p-4 bg-primary-600 text-white rounded-2xl shadow-xl active:scale-95 transition-all hover:bg-primary-700 disabled:opacity-50">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-5 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-90 flex items-center justify-center ${isOpen ? 'bg-gray-100 text-gray-600' : 'bg-primary-600 text-white'
                    }`}
            >
                {isOpen ? <X className="w-7 h-7" /> : (
                    <div className="relative">
                        <MessageCircle className="w-7 h-7" />
                        <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-white animate-pulse" />
                    </div>
                )}
            </button>
        </div>
    );
};

export default FloatingChatbot;
