
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserProfile, WorkoutLocation, Exercise, BMICategory } from '../types';
import { EXERCISES } from '../constants';
import { EmptyState } from './LoadingSkeleton';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

// Generate or retrieve a device ID for anonymous users
const getDeviceId = () => {
  let deviceId = localStorage.getItem('fitguide_device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('fitguide_device_id', deviceId);
  }
  return deviceId;
};

interface WorkoutViewProps {
  user: UserProfile;
}

const WorkoutTimer: React.FC<{ duration: number; onComplete: () => void }> = ({ duration: initialDuration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [customDuration, setCustomDuration] = useState(initialDuration);
  const [isEditing, setIsEditing] = useState(false);

  // Beep sound using Web Audio API
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        return;
      }

      const audioContext = new AudioContextClass();

      // Resume audio context if suspended (required for browser autoplay policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => { });
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880; // A5 note
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);

      // Play a second beep with different frequency
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        oscillator2.frequency.value = 1000;
        oscillator2.type = 'sine';
        gainNode2.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.8);
      }, 300);
    } catch (error) {
      console.error('Error playing beep:', error);
    }
  };

  useEffect(() => {
    let interval: number;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            playBeep();
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDurationChange = (newDuration: number) => {
    setCustomDuration(newDuration);
    setTimeLeft(newDuration);
    setIsEditing(false);
  };

  const presetTimes = [
    { label: '30s', seconds: 30 },
    { label: '1m', seconds: 60 },
    { label: '2m', seconds: 120 },
    { label: '3m', seconds: 180 },
    { label: '5m', seconds: 300 },
  ];

  return (
    <div className="space-y-4">
      {/* Duration Selector */}
      <div className="bg-slate-800 p-4 rounded-2xl">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="w-full flex items-center justify-between text-white text-sm font-medium mb-3 hover:text-emerald-400 transition-colors"
        >
          <span>⏱️ Timer Duration: {formatTime(customDuration)}</span>
          <span className="text-slate-400">{isEditing ? '▲ Hide' : '▼ Change'}</span>
        </button>

        {isEditing && (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-wrap gap-2">
              {presetTimes.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleDurationChange(preset.seconds)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${customDuration === preset.seconds
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="600"
                step="10"
                value={customDuration}
                onChange={(e) => setCustomDuration(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="10"
                max="600"
                value={customDuration}
                onChange={(e) => {
                  const val = Math.max(10, Math.min(600, parseInt(e.target.value) || 60));
                  setCustomDuration(val);
                }}
                onBlur={(e) => handleDurationChange(Math.max(10, Math.min(600, parseInt(e.target.value) || 60)))}
                className="w-20 px-2 py-1 bg-slate-700 text-white text-center text-sm font-mono rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-slate-400 text-xs">sec</span>
              <button
                onClick={() => handleDurationChange(customDuration)}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all"
              >
                Set
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="flex items-center gap-4 bg-slate-900 text-white p-6 rounded-[32px] shadow-xl">
        <div className="text-3xl font-black font-mono w-24">{formatTime(timeLeft)}</div>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
        >
          {isActive ? 'Pause' : timeLeft === customDuration ? 'Start Timer' : 'Resume'}
        </button>
        <button
          onClick={() => { setIsActive(false); setTimeLeft(customDuration); }}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xl transition-all"
          title="Reset"
        >
          🔄
        </button>
      </div>
    </div>
  );
};

const WorkoutView: React.FC<WorkoutViewProps> = ({ user }) => {
  const { user: authUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeFilter = (searchParams.get('filter') as 'All' | 'Strength' | 'Cardio' | 'Core') || 'All';
  const activeMuscle = searchParams.get('muscle') || undefined;

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showCompleteToast, setShowCompleteToast] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const exercisesPerPage = 8;

  // Get user ID (authenticated user or anonymous device)
  const getCurrentUserId = () => {
    if (authUser?.id) return authUser.id;
    return getDeviceId();
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [activeFilter, activeMuscle]);

  const bmi = useMemo(() => {
    const heightInMeters = user.height / 100;
    const score = user.weight / (heightInMeters * heightInMeters);
    if (score < 18.5) return BMICategory.UNDERWEIGHT;
    if (score < 25) return BMICategory.NORMAL;
    return BMICategory.OVERWEIGHT;
  }, [user.weight, user.height]);

  const processedExercises = useMemo(() => {
    // 1. Initial location filter
    let pool = EXERCISES.filter(ex =>
      ex.location.some(loc => loc.toLowerCase() === user.location.toLowerCase())
    );

    // 2. Equipment Substitution Logic
    if (user.location === WorkoutLocation.GYM) {
      const available = user.availableEquipment || [];
      let finalPool: Exercise[] = [];

      EXERCISES.forEach(ex => {
        const needsSpecificMachine = ex.equipmentRequired;
        const isAvailable = needsSpecificMachine ? available.includes(needsSpecificMachine) : true;

        if (isAvailable && !ex.isReplacement) {
          finalPool.push(ex);
        } else if (needsSpecificMachine && !isAvailable) {
          const replacement = EXERCISES.find(rep => rep.replacesId === ex.id);
          if (replacement) finalPool.push(replacement);
        }
      });
      pool = finalPool.filter(ex =>
        ex.location.some(loc => loc.toLowerCase() === user.location.toLowerCase())
      );
    }

    // 3. Smart Filter (Muscle, Difficulty, or Location)
    if (activeMuscle) {
      const search = activeMuscle.toLowerCase();
      pool = pool.filter(ex => {
        const matchesMuscle = ex.muscles.some(m => m.toLowerCase().includes(search));
        const matchesDifficulty = ex.difficulty?.toLowerCase() === search;
        const matchesLocation = search === 'home' ? ex.location.includes(WorkoutLocation.HOME) : false;

        return matchesMuscle || matchesDifficulty || matchesLocation;
      });
    }

    // 4. BMI Priority Sorting
    pool = [...pool].sort((a, b) => {
      if (bmi === BMICategory.UNDERWEIGHT) {
        if (a.category === 'Strength' && b.category !== 'Strength') return -1;
        if (b.category === 'Strength' && a.category !== 'Strength') return 1;
      } else if (bmi === BMICategory.OVERWEIGHT) {
        if (a.category === 'Cardio' && b.category !== 'Cardio') return -1;
        if (b.category === 'Cardio' && a.category !== 'Cardio') return 1;
      }
      return 0;
    });

    // 5. Category Filter
    if (activeFilter !== 'All') {
      pool = pool.filter(ex => ex.category === activeFilter);
    }

    return pool;
  }, [user.location, user.availableEquipment, activeFilter, activeMuscle, bmi]);

  // Pagination for progressive disclosure
  const paginatedExercises = useMemo(() => {
    const startIndex = (currentPage - 1) * exercisesPerPage;
    return processedExercises.slice(startIndex, startIndex + exercisesPerPage);
  }, [processedExercises, currentPage]);

  const totalPages = Math.ceil(processedExercises.length / exercisesPerPage);

  const handleExerciseComplete = async () => {
    if (selectedExercise) {
      const userId = getCurrentUserId();
      const completedAt = new Date().toISOString();

      // Generate a temporary ID for the log
      const tempId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create the workout log object
      const newLog: any = {
        id: tempId,
        user_id: userId,
        exercise_id: selectedExercise.id,
        exercise_name: selectedExercise.name,
        category: selectedExercise.category,
        muscles: selectedExercise.muscles,
        sets: selectedExercise.sets,
        reps: selectedExercise.reps,
        completed_at: completedAt,
        created_at: completedAt,
      };

      // 1. OPTIMISTIC SAVE: Save to LocalStorage immediately
      try {
        const existingLogs = JSON.parse(localStorage.getItem('fitguide_workout_logs') || '[]');
        const updatedLogs = [newLog, ...existingLogs];
        localStorage.setItem('fitguide_workout_logs', JSON.stringify(updatedLogs));
        console.log('Optimistically saved to localStorage:', newLog);

        // Dispatch event immediately so UI updates
        window.dispatchEvent(new CustomEvent('fitguide_workout_logged', { detail: newLog }));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
        alert('Failed to save workout locally. Please check your device storage.');
        return; // Don't proceed if we can't even save locally
      }

      // 2. Background Sync: Try to save to Supabase
      // We don't await this to block the UI, but we handle the result to update the ID if successful
      (async () => {
        try {
          const { data: inserted, error } = await Promise.race([
            supabase
              .from('workout_logs')
              .insert({
                user_id: userId,
                exercise_id: selectedExercise.id,
                exercise_name: selectedExercise.name,
                category: selectedExercise.category,
                muscles: selectedExercise.muscles,
                sets: selectedExercise.sets,
                reps: selectedExercise.reps,
                completed_at: completedAt,
              })
              .select()
              .single(),
            new Promise<{ data: null; error: any }>((resolve) =>
              setTimeout(() => resolve({ data: null, error: { message: 'Timeout' } }), 5000)
            )
          ]);

          if (error) throw error;

          if (inserted) {
            console.log('Synced to Supabase:', inserted);
            // Update the local log with the real ID from server
            try {
              const currentLogs = JSON.parse(localStorage.getItem('fitguide_workout_logs') || '[]');
              const updatedLogs = currentLogs.map((log: any) =>
                log.id === tempId ? { ...inserted, created_at: inserted.created_at || completedAt } : log
              );
              localStorage.setItem('fitguide_workout_logs', JSON.stringify(updatedLogs));
            } catch (e) {
              console.warn('Failed to update local log with server ID:', e);
            }
          }
        } catch (err) {
          console.warn('Background sync failed (keeping local copy):', err);
        }
      })();
    }

    setSelectedExercise(null);
    setShowCompleteToast(true);
    setTimeout(() => setShowCompleteToast(false), 3000);
  };



  return (
    <div className="space-y-6 relative">
      {showCompleteToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-[200] animate-bounce font-black flex items-center gap-3">
          <span>🎉</span> Exercise Logged Successfully!
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-2xl font-black text-slate-800">
              {activeMuscle ? `${activeMuscle} Workout` : 'Your Curated Plan'}
            </h3>
            <p className="text-slate-500 text-sm">
              {user.location} Session • {activeMuscle ? `Targeting ${activeMuscle}` : `Optimized for ${bmi}`} • {processedExercises.length} exercises
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all md:hidden"
          >
            🎯 Filters
            <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Category Filters */}
        <div className={`flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 ${showFilters ? 'block' : 'hidden md:flex'}`}>
          {['All', 'Strength', 'Cardio', 'Core'].map((f) => (
            <button
              key={f}
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('filter', f);
                setSearchParams(newParams);
              }}
              className={`whitespace-nowrap px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === f ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {f}
            </button>
          ))}
          {activeMuscle && (
            <button
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('muscle');
                setSearchParams(newParams);
              }}
              className="whitespace-nowrap px-6 py-2 rounded-xl text-xs font-black text-red-500 hover:bg-red-50 transition-all"
            >
              Clear Muscle Filter ✕
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSearchParams({ filter: 'All' });
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === 'All' && !activeMuscle ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
          >
            Show All
          </button>
          <button
            onClick={() => {
              setSearchParams({ filter: 'All', muscle: 'Beginner' });
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeMuscle === 'Beginner' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'}`}
          >
            🟢 Beginner Only
          </button>
          <button
            onClick={() => {
              setSearchParams({ filter: 'All', muscle: 'Home' });
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeMuscle === 'Home' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
          >
            🏠 Home Friendly
          </button>
        </div>
      </div>

      {processedExercises.length === 0 ? (
        <EmptyState
          icon="🤷‍♂️"
          title="No matching exercises found"
          description="Try clearing your muscle filter or changing categories to see more workouts."
          action={{
            label: "Clear All Filters",
            onClick: () => {
              setSearchParams(new URLSearchParams({ filter: 'All' }));
            }
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedExercises.map((ex) => (
              <div
                key={ex.id}
                className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-8px] transition-all duration-500 group cursor-pointer relative"
                onClick={() => setSelectedExercise(ex)}
              >
                {ex.isReplacement && (
                  <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                    Substituted for Machine
                  </div>
                )}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={ex.image}
                    alt={ex.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml;base64,${btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
                          <rect width="400" height="300" fill="#f1f5f9"/>
                          <text x="200" y="150" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="24" fill="#64748b">🏋️‍♂️</text>
                        </svg>
                      `)}`;
                    }}
                  />
                  <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                    <span className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black text-white uppercase tracking-[0.1em] border border-white/20">{ex.category}</span>
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black text-white uppercase tracking-[0.1em] ${ex.difficulty === 'Beginner' ? 'bg-emerald-500/80 border border-emerald-400/20' : 'bg-orange-500/80 border border-orange-400/20'}`}>
                      {ex.difficulty}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h4 className="text-2xl font-black text-slate-800 mb-3 leading-tight">{ex.name}</h4>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest">{ex.muscles.join(' / ')}</p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-50 text-emerald-600 w-10 h-10 rounded-2xl flex items-center justify-center text-sm shadow-sm">
                        ⚡
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Target</p>
                        <p className="text-sm font-bold text-slate-800">{ex.sets} × {ex.reps}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExercise(ex);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Start Workout
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-slate-100">
              <div className="text-slate-500 text-sm font-medium">
                Showing {((currentPage - 1) * exercisesPerPage) + 1}-{Math.min(currentPage * exercisesPerPage, processedExercises.length)} of {processedExercises.length} exercises
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 rounded-xl text-sm font-bold transition-all"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === pageNum
                          ? 'bg-emerald-500 text-white shadow-lg'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 rounded-xl text-sm font-bold transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Exercise Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setSelectedExercise(null)}></div>
          <div className="relative bg-white w-full max-w-5xl rounded-[50px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col md:flex-row max-h-[90vh]">
            <button
              className="absolute top-8 right-8 w-12 h-12 bg-black/10 hover:bg-black/20 backdrop-blur-md rounded-full text-white text-2xl flex items-center justify-center z-20 transition-all border border-white/20"
              onClick={() => setSelectedExercise(null)}
            >
              ✕
            </button>
            <div className="w-full md:w-1/2 h-[250px] md:h-auto overflow-hidden">
              <img src={selectedExercise.image} alt={selectedExercise.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 p-10 md:p-16 overflow-y-auto flex flex-col justify-center">
              <div className="mb-8">
                <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">{selectedExercise.category}</span>
                <h3 className="text-4xl font-black text-slate-800 leading-[1.1]">{selectedExercise.name}</h3>
                {selectedExercise.isReplacement && (
                  <p className="text-orange-600 text-xs font-black mt-2 uppercase tracking-widest">Substitution Active: Machine was not available</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-slate-50 p-6 rounded-[30px] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Muscles</p>
                  <p className="text-lg font-bold text-slate-700">{selectedExercise.muscles.join(', ')}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-[30px] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plan</p>
                  <p className="text-lg font-bold text-slate-700">{selectedExercise.sets} Sets / {selectedExercise.reps}</p>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <h4 className="font-black text-slate-800 text-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-sm">!</div>
                  Instructions
                </h4>
                <p className="text-slate-500 text-lg leading-relaxed">{selectedExercise.instruction}</p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rest Timer</p>
                <WorkoutTimer duration={60} onComplete={() => { }} />
              </div>

              <div className="mt-12 flex gap-4">
                <button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-[24px] shadow-xl shadow-emerald-200 transition-all text-lg"
                  onClick={handleExerciseComplete}
                >
                  Mark as Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutView;
