import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen flex bg-white font-inter">
            {/* Left Side - Hero/Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 items-center justify-center p-12 text-white">
                {/* Abstract Background Shapes */}
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-300 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-300 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

                <div className="relative z-10 max-w-lg text-center lg:text-left space-y-8">
                    <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4">
                        <div className="text-6xl animate-bounce-slow drop-shadow-2xl">💪</div>
                        <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-100 drop-shadow-sm">FitGuide</h1>
                    </div>
                    <div>
                        <h2 className="text-4xl font-extrabold leading-tight mb-6 drop-shadow-md">Crush Your Goals.<br />Unleash Your Potential.</h2>
                        <p className="text-lg text-emerald-50 font-medium leading-relaxed opacity-90">Experience the next generation of workout tracking. Precision logging, powerful analytics, and a community that moves with you.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-8 text-left">
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 transform hover:scale-105 transition-all duration-300">
                            <div className="text-3xl font-black mb-1">50+</div>
                            <div className="text-sm text-emerald-100 font-bold uppercase tracking-wider">Exercises</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 transform hover:scale-105 transition-all duration-300 delay-100">
                            <div className="text-3xl font-black mb-1">100%</div>
                            <div className="text-sm text-emerald-100 font-bold uppercase tracking-wider">Free Tracking</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-[32px] shadow-xl border border-slate-100">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-slate-800">{title}</h2>
                        <p className="text-slate-500 mt-2 font-medium">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
