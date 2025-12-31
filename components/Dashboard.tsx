
import React, { useEffect, useState } from 'react';
import { UserProfile, BMIInfo, BMICategory, WorkoutLocation } from '../types';
import { getFitnessInsight, generateAiWorkoutRoutine } from '../services/geminiService';

interface DashboardProps {
  user: UserProfile;
  onStartSession?: (filter: 'All' | 'Strength' | 'Cardio' | 'Core', muscle?: string) => void;
}

const MUSCLE_GROUPS = [
  { id: 'Chest', name: 'Chest', image: 'Screenshot 2025-12-29 at 7.23.15 PM.png' },
  { id: 'Back', name: 'Back', image: 'Screenshot 2025-12-29 at 7.34.24 PM.png' },
  { id: 'Legs', name: 'Legs', image: 'Screenshot 2025-12-29 at 7.40.22 PM.png' },
  { id: 'Biceps', name: 'Biceps', image: 'Screenshot 2025-12-29 at 7.44.07 PM.png' },
  { id: 'Shoulders', name: 'Shoulders', image: 'Screenshot 2025-12-29 at 7.46.56 PM.png' },
  { id: 'Triceps', name: 'Triceps', image: 'Screenshot 2025-12-29 at 7.49.30 PM.png' },
  { id: 'Core', name: 'Core / Abs', image: 'Screenshot 2025-12-29 at 7.29.16 PM.png' },
];

const Dashboard: React.FC<DashboardProps> = ({ user, onStartSession }) => {
  const [insight, setInsight] = useState<string>('Generating your personalized insight...');
  const [bmi, setBmi] = useState<BMIInfo | null>(null);
  const [aiRoutine, setAiRoutine] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showMusclePicker, setShowMusclePicker] = useState(false);

  useEffect(() => {
    const heightInMeters = user.height / 100;
    const score = user.weight / (heightInMeters * heightInMeters);
    let category = BMICategory.NORMAL;
    let message = "“Based on your height and weight, this workout plan is recommended for you.”";

    if (score < 18.5) {
      category = BMICategory.UNDERWEIGHT;
    } else if (score < 25) {
      category = BMICategory.NORMAL;
    } else {
      category = BMICategory.OVERWEIGHT;
    }

    setBmi({
      score,
      category,
      idealRange: { min: 18.5, max: 24.9 },
      message
    });

    const fetchInsight = async () => {
      const result = await getFitnessInsight(user, score, category);
      if (result) setInsight(result);
    };
    fetchInsight();
  }, [user]);

  const handleGenerateAiWorkout = async () => {
    if (!bmi) return;
    setLoadingAi(true);
    const routine = await generateAiWorkoutRoutine(user, bmi.category);
    setAiRoutine(routine);
    setLoadingAi(false);
  };

  if (!bmi) return <div className="p-8 text-center text-slate-500 font-bold">Analyzing Profile...</div>;

  const getRecommendedFilter = () => {
    if (bmi.category === BMICategory.UNDERWEIGHT) return 'Strength';
    if (bmi.category === BMICategory.OVERWEIGHT) return 'Cardio';
    return 'All';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* 1. BMI & Status Analysis Section */}
      <section className="bg-white p-8 md:p-12 rounded-[50px] border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
          <div className="w-full md:w-2/5 text-center md:text-left">
            <h3 className="text-3xl font-black text-slate-800 mb-4">Fitness Profile</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto md:mx-0">
              {bmi.message}
            </p>
            
            <div className="relative inline-flex flex-col items-center justify-center">
                <svg className="w-48 h-48 -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-emerald-500" strokeDasharray={552} strokeDashoffset={552 - (552 * Math.min(bmi.score / 40, 1))} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-5xl font-black text-slate-800 leading-none">{bmi.score.toFixed(1)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">BMI SCORE</p>
                </div>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-6 py-2 bg-emerald-50 rounded-full border border-emerald-100 text-xs font-bold text-emerald-700 uppercase tracking-widest">{bmi.category}</span>
              <span className="px-6 py-2 bg-blue-50 rounded-full border border-blue-100 text-xs font-bold text-blue-700 uppercase tracking-widest">{user.location} WORKOUT</span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-6">
            <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Coach Insight</p>
              </div>
              <p className="text-slate-300 text-lg italic leading-relaxed mb-6">"{insight}"</p>
              <button 
                onClick={() => onStartSession?.(getRecommendedFilter())}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                Browse Recommended Library ➔
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Goal</p>
                <p className="text-xl font-black text-slate-800">4 Sessions</p>
              </div>
              <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Rest</p>
                <p className="text-xl font-black text-slate-800">Tomorrow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: AI Personal Coach Banner */}
      <section className="bg-indigo-600 rounded-[50px] p-8 md:p-12 text-white shadow-xl shadow-indigo-100 flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="flex-1 relative z-10 text-center lg:text-left">
          <div className="inline-block px-4 py-1.5 bg-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-400/30">Gemini Powered</div>
          <h3 className="text-3xl md:text-4xl font-black mb-4">AI Daily Personal Trainer</h3>
          <p className="text-indigo-100 text-lg opacity-90 max-w-xl">
            Don't want to browse? Let our AI Coach build you a 100% custom routine for today based on your {user.location} equipment.
          </p>
        </div>
        <button 
          onClick={handleGenerateAiWorkout}
          disabled={loadingAi}
          className={`relative z-10 px-12 py-6 bg-white text-indigo-600 rounded-[32px] font-black text-xl shadow-2xl hover:bg-indigo-50 transition-all flex items-center gap-3 active:scale-95 ${loadingAi ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loadingAi ? 'Coach is Thinking...' : 'Generate Today\'s Routine ✨'}
        </button>
      </section>

      {/* Muscle Picker Modal */}
      {showMusclePicker && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowMusclePicker(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[50px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-black text-slate-800 mb-2">What are we training?</h3>
            <p className="text-slate-400 font-bold mb-8">Select a body group to see curated exercises.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {MUSCLE_GROUPS.map(muscle => (
                <button
                  key={muscle.id}
                  onClick={() => {
                    onStartSession?.('Strength', muscle.id);
                    setShowMusclePicker(false);
                  }}
                  className="p-8 rounded-[32px] border-2 border-slate-50 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex flex-col items-center gap-3 group overflow-hidden"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src={muscle.image} 
                      alt={muscle.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallbackSpan = document.createElement('span');
                          fallbackSpan.className = 'text-4xl';
                          fallbackSpan.textContent = '💪';
                          parent.appendChild(fallbackSpan);
                        }
                      }}
                    />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{muscle.name}</span>
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => onStartSession?.('Strength')}
              className="w-full mt-8 py-5 text-slate-400 font-black text-sm uppercase tracking-widest hover:text-slate-800 transition-colors"
            >
              Show All Strength Exercises
            </button>
          </div>
        </div>
      )}

      {/* AI Routine Modal/Display */}
      {aiRoutine && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setAiRoutine(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[50px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
              <div>
                <h4 className="text-2xl font-black">Your AI Personal Plan</h4>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Built specially for {user.firstName}</p>
              </div>
              <button onClick={() => setAiRoutine(null)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-xl">✕</button>
            </div>
            <div className="p-10 overflow-y-auto max-h-[70vh] bg-slate-50">
              <div className="prose prose-slate max-w-none">
                {aiRoutine.split('\n').map((line, i) => (
                  <p key={i} className={`mb-3 text-slate-700 leading-relaxed ${line.startsWith('#') || line.includes('Sets:') ? 'font-black text-indigo-600' : ''}`}>
                    {line}
                  </p>
                ))}
              </div>
              <div className="mt-10 p-6 bg-indigo-50 rounded-[32px] border border-indigo-100 flex items-center gap-4 text-indigo-700">
                <span className="text-2xl">💡</span>
                <p className="text-sm font-bold">Follow this routine step-by-step for maximum results today.</p>
              </div>
              <button 
                onClick={() => setAiRoutine(null)}
                className="w-full mt-8 py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-xl hover:bg-indigo-600 transition-all"
              >
                Let's Get Started!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Unified Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Strength Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col group relative overflow-hidden min-h-[280px]">
          <div className="relative z-10">
            <div className="bg-emerald-100 text-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6">💪</div>
            <h4 className="text-2xl font-black text-slate-800 mb-2">Build Power</h4>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">Strength training focused on {bmi.category === BMICategory.UNDERWEIGHT ? 'building muscle mass' : 'toning and defining'}.</p>
            <button 
              onClick={() => setShowMusclePicker(true)}
              className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg active:scale-95 mt-auto"
            >
              Strength Workouts
            </button>
          </div>
          <div className="absolute -bottom-4 -right-4 text-9xl opacity-[0.03] group-hover:scale-110 transition-transform duration-700">🏋️</div>
        </div>

        {/* Cardio Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col group relative overflow-hidden min-h-[280px]">
          <div className="relative z-10">
            <div className="bg-blue-100 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6">🏃</div>
            <h4 className="text-2xl font-black text-slate-800 mb-2">Burn & Stamina</h4>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">Boost metabolism and improve heart health with {bmi.category === BMICategory.OVERWEIGHT ? 'high intensity' : 'steady'} cardio.</p>
            <button 
              onClick={() => onStartSession?.('Cardio')}
              className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-lg active:scale-95 mt-auto"
            >
              Cardio Workouts
            </button>
          </div>
          <div className="absolute -bottom-4 -right-4 text-9xl opacity-[0.03] group-hover:scale-110 transition-transform duration-700">🚲</div>
        </div>

        {/* Core/All Mixed Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col group relative overflow-hidden min-h-[280px]">
          <div className="relative z-10">
            <div className="bg-orange-100 text-orange-600 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6">🎯</div>
            <h4 className="text-2xl font-black text-slate-800 mb-2">Daily Mix</h4>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">A balanced selection of core stability and general exercises for a complete workout.</p>
            <button 
              onClick={() => onStartSession?.('All')}
              className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-orange-500 transition-all shadow-lg active:scale-95 mt-auto"
            >
              Browse Full Library
            </button>
          </div>
          <div className="absolute -bottom-4 -right-4 text-9xl opacity-[0.03] group-hover:scale-110 transition-transform duration-700">⚡</div>
        </div>
      </div>

      {/* 3. Location Specific Banner */}
      <div className={`p-10 rounded-[40px] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 transition-all ${user.location === WorkoutLocation.HOME ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-100' : 'bg-gradient-to-r from-slate-800 to-slate-900 shadow-slate-200'}`}>
        <div className="text-center md:text-left flex-1">
          <h4 className="text-2xl md:text-3xl font-black mb-3 leading-tight">
            {user.location === WorkoutLocation.HOME 
              ? "“You do NOT need gym machines or dumbbells to stay fit at home.”" 
              : "Maximize your gym access with structured machine routines."}
          </h4>
          <p className="text-white/80 text-base leading-relaxed">
            {user.location === WorkoutLocation.HOME 
              ? "We've tailored your library to use only bodyweight and simple household items." 
              : "Learn exactly how to use equipment effectively to reach your goals faster."}
          </p>
        </div>
        <div className="bg-white/20 p-8 rounded-full backdrop-blur-xl border border-white/20 shadow-inner group cursor-pointer hover:bg-white/30 transition-all" onClick={() => onStartSession?.('All')}>
          <span className="text-6xl">{user.location === WorkoutLocation.HOME ? '🏠' : '🏢'}</span>
        </div>
      </div>

      {/* 4. Equipment Availability Summary */}
      <div className="bg-white p-8 md:p-12 rounded-[50px] border border-slate-100 shadow-sm">
        <h4 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
          <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm">📋</span>
          Plan Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">✔</div>
            <p className="font-bold text-slate-700 text-sm">Strength Protocols Included</p>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">✔</div>
            <p className="font-bold text-slate-700 text-sm">Cardio Zones Active</p>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.location === WorkoutLocation.GYM ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
              {user.location === WorkoutLocation.GYM ? '✔' : '✕'}
            </div>
            <p className="font-bold text-slate-700 text-sm">Full Machine Support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
