import React, { useState, useEffect, useMemo } from 'react';
import { supabase, WorkoutLog } from '../services/supabase';
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

const ProgressView: React.FC = () => {
  const { user } = useAuth();
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deviceId = getDeviceId();
  const currentUserId = user?.id || deviceId;

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch from Supabase
      let supabaseData: WorkoutLog[] = [];
      try {
        let query = supabase
          .from('workout_logs')
          .select('*')
          .order('completed_at', { ascending: false });

        if (user) {
          query = query.eq('user_id', user.id);
        } else {
          query = query.eq('user_id', deviceId);
        }

        const { data, error } = await Promise.race([
          query,
          new Promise<{ data: null; error: { message: string } }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: { message: 'Timeout' } }), 2000)
          )
        ]);
        if (error) throw error;
        supabaseData = data || [];
      } catch (err: any) {
        console.warn('Error loading logs from Supabase:', err);
        // Don't set error state yet, as we might have local data
        if (!navigator.onLine) {
          setError(err.message || 'Offline mode');
        }
      }

      // 2. Fetch from LocalStorage
      let localData: WorkoutLog[] = [];
      try {
        const savedLogs = localStorage.getItem('fitguide_workout_logs');
        if (savedLogs) {
          localData = JSON.parse(savedLogs);
        }
      } catch (err) {
        console.warn('Error parsing local logs:', err);
      }

      // 3. Merge and Deduplicate
      // Create a map by ID to deduplicate. Prefer Supabase data if ID conflicts (usually should be same).
      // However, local data might have temporary IDs that are not in Supabase yet.
      // Or local data might be the same content.

      const mergedMap = new Map<string, WorkoutLog>();

      // Add local data first
      localData.forEach(log => mergedMap.set(log.id, log));

      // Add Supabase data (overwriting local duplicates if IDs match)
      supabaseData.forEach(log => mergedMap.set(log.id, log));

      const mergedLogs = Array.from(mergedMap.values())
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

      console.log(`Loaded ${mergedLogs.length} logs (${localData.length} local, ${supabaseData.length} remote)`);
      setWorkoutLogs(mergedLogs);

    } catch (err: any) {
      console.error('Error in loadLogs:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [user]);

  // Listen for custom event when workout is logged
  useEffect(() => {
    const handleWorkoutLogged = (e: Event | any) => {
      try {
        const detail = e?.detail as unknown as WorkoutLog | undefined | null;
        if (detail && detail.id) {
          // Merge the new log into state immediately to show instant feedback
          setWorkoutLogs((prev) => {
            // Avoid duplicate ids
            if (prev.some((p) => p.id === detail.id)) return prev;
            return [detail, ...prev];
          });
          console.log('Workout logged event received, merged new log:', detail);
          // Still trigger a background refresh to reconcile with server
          loadLogs();
          return;
        }
      } catch (err) {
        console.warn('Error handling workout logged event detail:', err);
      }
      console.log('Workout logged event received, refreshing...');
      loadLogs();
    };

    const handleWorkoutsMigrated = () => {
      console.log('Workouts migrated event received, refreshing...');
      loadLogs();
    };

    window.addEventListener('fitguide_workout_logged', handleWorkoutLogged);
    window.addEventListener('fitguide_workouts_migrated', handleWorkoutsMigrated);

    return () => {
      window.removeEventListener('fitguide_workout_logged', handleWorkoutLogged);
      window.removeEventListener('fitguide_workouts_migrated', handleWorkoutsMigrated);
    };
  }, []);

  const getDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const today = getDateString(new Date());
  const yesterday = getDateString(new Date(Date.now() - 86400000));
  const sevenDaysAgo = getDateString(new Date(Date.now() - 7 * 86400000));
  const thirtyDaysAgo = getDateString(new Date(Date.now() - 30 * 86400000));

  const groupedLogs = useMemo(() => {
    const groups: { [key: string]: WorkoutLog[] } = {};

    workoutLogs.forEach((log) => {
      if (!log.completed_at) return;
      try {
        const dateKey = log.completed_at.split('T')[0];
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(log);
      } catch (e) {
        console.warn('Error grouping log:', log, e);
      }
    });

    // Sort by date descending
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  }, [workoutLogs]);

  const filteredLogs = useMemo(() => {
    switch (selectedPeriod) {
      case 'today':
        return groupedLogs.filter(([date]) => date === today);
      case 'week':
        return groupedLogs.filter(([date]) => date >= sevenDaysAgo);
      case 'month':
        return groupedLogs.filter(([date]) => date >= thirtyDaysAgo);
      default:
        return groupedLogs;
    }
  }, [groupedLogs, selectedPeriod, today, sevenDaysAgo, thirtyDaysAgo]);

  const stats = useMemo(() => {
    const logsToUse = filteredLogs.flatMap(([, logs]) => logs);
    return {
      totalWorkouts: logsToUse.length,
      strengthCount: logsToUse.filter((l) => l.category === 'Strength').length,
      cardioCount: logsToUse.filter((l) => l.category === 'Cardio').length,
      coreCount: logsToUse.filter((l) => l.category === 'Core').length,
    };
  }, [filteredLogs]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const todayDate = new Date();
    const yesterdayDate = new Date(Date.now() - 86400000);

    if (dateStr === getDateString(todayDate)) return 'Today';
    if (dateStr === getDateString(yesterdayDate)) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const clearAllLogs = async () => {
    if (confirm('Are you sure you want to clear all workout history? This cannot be undone.')) {
      try {
        // Delete from Supabase
        let query = supabase
          .from('workout_logs')
          .delete();

        if (user) {
          query = query.eq('user_id', user.id);
        } else {
          query = query.eq('user_id', deviceId);
        }

        const { error } = await query;
        if (error) throw error;
      } catch (err: any) {
        console.error('Error clearing logs from Supabase:', err);
      }

      // Also clear localStorage as fallback
      localStorage.removeItem('fitguide_workout_logs');
      setWorkoutLogs([]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">📊 Progress Tracker</h2>
            <p className="text-slate-500 text-sm">
              {user ? 'Your personal workout history' : 'Track your workout progress'}
            </p>
          </div>
          {user ? (
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
              ✓ Signed In
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
              Guest Mode
            </span>
          )}
        </div>
        {error && (
          <p className="text-orange-500 text-xs mt-2">⚠️ Using offline mode - sync when online</p>
        )}
      </div>

      {/* Period Filter */}
      <div className="bg-white p-4 rounded-[24px] border border-slate-100">
        <div className="flex gap-2">
          {[
            { key: 'today', label: 'Today' },
            { key: 'week', label: '7 Days' },
            { key: 'month', label: '30 Days' },
            { key: 'all', label: 'All Time' },
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as any)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${selectedPeriod === period.key
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[24px] border border-slate-100">
          <div className="text-3xl font-black text-slate-800">{stats.totalWorkouts}</div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Workouts</div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-100">
          <div className="text-3xl font-black text-emerald-600">{stats.strengthCount}</div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Strength</div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-100">
          <div className="text-3xl font-black text-orange-500">{stats.cardioCount}</div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cardio</div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-100">
          <div className="text-3xl font-black text-blue-500">{stats.coreCount}</div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Core</div>
        </div>
      </div>

      {/* Clear History Button */}
      {workoutLogs.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={clearAllLogs}
            className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-all"
          >
            🗑️ Clear All History
          </button>
        </div>
      )}

      {/* Workout History */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white p-12 rounded-[32px] border border-slate-100 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-black text-slate-800 mb-2">No Workouts Yet</h3>
          <p className="text-slate-500 mb-6">Complete some exercises to see your progress here!</p>
          {!user && (
            <a
              href="/signup"
              className="inline-block py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all"
            >
              Create Account to Save Progress
            </a>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-800">Workout History</h3>
          </div>

          {filteredLogs.map(([date, logs]) => (
            <div key={date} className="border-b border-slate-50 last:border-0">
              <div className="px-6 py-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-700">{formatDate(date)}</span>
                  <span className="text-sm font-bold text-slate-400">{logs.length} exercise{logs.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {logs.map((log) => (
                  <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-25 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${log.category === 'Strength' ? 'bg-emerald-100' :
                        log.category === 'Cardio' ? 'bg-orange-100' : 'bg-blue-100'
                        }`}>
                        {log.category === 'Strength' ? '💪' : log.category === 'Cardio' ? '🏃' : '🔥'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{log.exercise_name}</div>
                        <div className="text-sm text-slate-400">
                          {log.muscles?.join(', ')} • {log.sets} × {log.reps}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400">{formatTime(log.completed_at)}</div>
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-black uppercase ${log.category === 'Strength' ? 'bg-emerald-100 text-emerald-700' :
                        log.category === 'Cardio' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {log.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats Summary */}
      {stats.totalWorkouts > 0 && (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-[32px] text-white">
          <h3 className="text-lg font-black mb-4">🏆 This Period Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
              <div className="text-3xl font-black">{stats.totalWorkouts}</div>
              <div className="text-sm font-bold opacity-80">Exercises Completed</div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-center">
              <div className="text-3xl font-black">
                {Math.round((stats.strengthCount / Math.max(stats.totalWorkouts, 1)) * 100)}%
              </div>
              <div className="text-sm font-bold opacity-80">Strength Focus</div>
            </div>
          </div>
          <div className="mt-4 bg-white/10 rounded-2xl p-4">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span>Strength</span>
              <span>{stats.strengthCount}</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2 mb-3">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${(stats.strengthCount / Math.max(stats.totalWorkouts, 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm font-bold mb-2">
              <span>Cardio</span>
              <span>{stats.cardioCount}</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2 mb-3">
              <div
                className="bg-orange-300 h-2 rounded-full transition-all"
                style={{ width: `${(stats.cardioCount / Math.max(stats.totalWorkouts, 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span>Core</span>
              <span>{stats.coreCount}</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2">
              <div
                className="bg-blue-300 h-2 rounded-full transition-all"
                style={{ width: `${(stats.coreCount / Math.max(stats.totalWorkouts, 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
      {/* Debug Info */}
      <div className="mt-8 p-4 bg-slate-100 rounded-xl text-xs font-mono text-slate-500 break-all">
        <p className="font-bold mb-2">🔧 Debug Info:</p>
        <p>User ID: {currentUserId}</p>
        <p>Total Logs Loaded: {workoutLogs.length}</p>
        <p>Period: {selectedPeriod}</p>
        <p>Filtered Logs: {filteredLogs.length} groups</p>
        <p>Local Storage: {localStorage.getItem('fitguide_workout_logs') ? JSON.parse(localStorage.getItem('fitguide_workout_logs') || '[]').length : 0} items</p>
        <div className="mt-2 border-t border-slate-300 pt-2">
          <p className="font-bold">First 3 Logs:</p>
          {workoutLogs.slice(0, 3).map((log, i) => (
            <div key={i} className="mb-1 p-1 bg-slate-200 rounded">
              <p>ID: {log.id}</p>
              <p>Date: {log.completed_at}</p>
              <p>User: {log.user_id}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressView;

