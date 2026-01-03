import React, { useState, useRef } from 'react';
import { analyzeEquipmentImage } from '../services/geminiService';

const ScannerPage: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage) return;

        setAnalyzing(true);
        setResult(null);
        try {
            const analysis = await analyzeEquipmentImage(selectedImage);
            setResult(analysis);
        } catch (error) {
            console.error('Scan error:', error);
            setResult('Failed to analyze image. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const resetScanner = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl">
                            🔍
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800">Equipment Scanner</h1>
                            <p className="text-slate-500 font-medium">Snap a photo to learn how to use any gym machine.</p>
                        </div>
                    </div>

                    {!previewUrl ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-4 border-dashed border-slate-100 rounded-[32px] p-12 flex flex-col items-center justify-center gap-4 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                📸
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-slate-700">Click to upload or take photo</p>
                                <p className="text-sm text-slate-400">Supports JPG, PNG (Max 5MB)</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="relative rounded-[32px] overflow-hidden bg-slate-100 aspect-video md:aspect-[21/9]">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                                {!analyzing && (
                                    <button
                                        onClick={resetScanner}
                                        className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold text-slate-600 shadow-lg hover:bg-white transition-colors"
                                    >
                                        Change Photo
                                    </button>
                                )}
                            </div>

                            {!result && (
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                    className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${analyzing
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200 active:scale-[0.98]'
                                        }`}
                                >
                                    {analyzing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                            Analyzing with AI...
                                        </>
                                    ) : (
                                        <>🚀 Start AI Scan</>
                                    )}
                                </button>
                            )}

                            {result && (
                                <div className="bg-slate-50 rounded-[32px] p-8 md:p-10 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                            ✨ AI Scan Results
                                        </h2>
                                        <button
                                            onClick={resetScanner}
                                            className="text-emerald-600 font-bold text-sm hover:underline"
                                        >
                                            Scan Another
                                        </button>
                                    </div>
                                    <div className="prose prose-slate max-w-none">
                                        <div className="whitespace-pre-wrap text-slate-600 leading-relaxed font-medium">
                                            {result}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { icon: '🤖', title: 'Powered by Gemini', desc: 'State-of-the-art vision AI' },
                    { icon: '🛡️', title: 'Safety First', desc: 'Ensures proper lifting form' },
                    { icon: '⚡', title: 'Instant Results', desc: 'Identify machines in seconds' }
                ].map((feat, i) => (
                    <div key={i} className="bg-white/50 backdrop-blur p-6 rounded-3xl border border-white/50 flex items-center gap-4">
                        <span className="text-2xl">{feat.icon}</span>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">{feat.title}</p>
                            <p className="text-xs text-slate-500">{feat.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScannerPage;
