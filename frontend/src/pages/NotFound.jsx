import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6 transition-all animate-fade-in">
            <div className="glass p-16 rounded-[3rem] max-w-lg shadow-2xl relative border-white">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 p-6 bg-rose-500 rounded-[2rem] shadow-xl text-white">
                    <AlertCircle className="w-12 h-12" />
                </div>

                <h2 className="text-8xl font-black font-outfit text-gray-900 mb-6 tracking-tighter">404</h2>
                <h3 className="text-2xl font-bold text-gray-700 mb-4 font-outfit">Bhai, ye page nahi mil raha! (Not Found)</h3>
                <p className="text-gray-500 mb-10 leading-relaxed max-w-xs mx-auto">
                    Aisa lagta hai tum galat raste par aa gaye ho. Wapas home page par chalein?
                </p>

                <Link to="/" className="btn-primary w-full h-14 text-lg">
                    <ArrowLeft className="w-5 h-5" /> Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
