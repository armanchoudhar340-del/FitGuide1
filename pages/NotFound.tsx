import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-9xl font-black text-emerald-500 mb-4">404</h1>
                <h2 className="text-3xl font-bold text-slate-800 mb-6">Page Not Found</h2>
                <p className="text-slate-500 mb-8 text-lg">Oops! The page you are looking for doesn't exist.</p>
                <Link
                    to="/"
                    className="inline-block bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-xl"
                >
                    Go Back Home ➔
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
