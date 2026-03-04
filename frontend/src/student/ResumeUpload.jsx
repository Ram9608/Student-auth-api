import React, { useState } from "react";
import api from "../api/axios";
import { UploadCloud, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

// 📄 Resume Upload UI (Phase 13 Part 2)
// Logic: PDF file handling and AJAX upload to FastAPI.

const ResumeUpload = () => {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const uploadResume = async () => {
        if (!file) return toast.warning("Pehle file select karein!");

        const formData = new FormData();
        formData.append("file", file);

        setIsLoading(true);
        try {
            // Note: Backend endpoint is /resumes/upload
            await api.post("/resumes/upload", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Resume uploaded successfully ✅");
            setFile(null); // Clear input
        } catch (err) {
            console.error(err);
            toast.error("Resume upload failed ❌");
        }
        setIsLoading(false);
    };

    return (
        <div className="glass p-8 rounded-[2rem] shadow-xl animate-fade-in border-white">
            <h2 className="text-2xl font-bold font-outfit text-gray-900 mb-6 flex items-center gap-3">
                <UploadCloud className="text-primary-600" /> Upload Resume (PDF)
            </h2>

            <div className="relative border-2 border-dashed border-primary-200 bg-primary-50/30 rounded-3xl p-8 flex flex-col items-center justify-center transition-all hover:bg-primary-50/50 group cursor-pointer">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />

                {file ? (
                    <div className="flex flex-col items-center gap-3">
                        <FileText className="w-12 h-12 text-primary-600 animate-bounce" />
                        <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{file.name}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <UploadCloud className="text-primary-400" />
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Apne PDF ko yahan drop karein</p>
                    </div>
                )}
            </div>

            <button
                onClick={uploadResume}
                disabled={isLoading || !file}
                className="btn-primary w-full h-12 mt-6 text-sm font-bold gap-2 shadow-lg disabled:opacity-50"
            >
                {isLoading ? 'Processing...' : <><UploadCloud className="w-4 h-4" /> Start AI Upload</>}
            </button>

            <p className="mt-4 text-[10px] text-gray-400 text-center uppercase font-bold tracking-[0.2em]">
                Only PDF files supported for AI Analysis
            </p>
        </div>
    );
};

export default ResumeUpload;
