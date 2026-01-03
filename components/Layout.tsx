import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile;
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const { signOut, user: authUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogModal, setShowLogModal] = useState(false);
  const [showLogToast, setShowLogToast] = useState(false);
  const [notificationToast, setNotificationToast] = useState(false);
  const [logData, setLogData] = useState({ type: 'Strength', duration: 30 });

  // Extract current page from path (e.g., /workouts -> workouts)
  const currentPage = location.pathname.substring(1) || 'dashboard';

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { id: 'workouts', icon: '🏋️', label: 'Workouts', path: '/workouts' },
    { id: 'progress', icon: '📈', label: 'Progress', path: '/progress' },
    { id: 'nutrition', icon: '🍎', label: 'Nutrition', path: '/nutrition' },
    { id: 'scanner', icon: '📸', label: 'AI Scanner', path: '/scanner' },
    { id: 'profile', icon: '👤', label: 'Profile', path: '/profile' },
  ];

  // Helper to get device ID if needed
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('fitguide_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('fitguide_device_id', deviceId);
    }
    return deviceId;
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = authUser?.id || getDeviceId();
    const completedAt = new Date().toISOString();
    const tempId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newLog: any = {
      id: tempId,
      user_id: userId,
      exercise_id: 'manual_log',
      exercise_name: `Quick ${logData.type} Session`,
      category: logData.type,
      muscles: [],
      sets: 1,
      reps: `${logData.duration} mins`,
      completed_at: completedAt,
      created_at: completedAt,
    };

    // 1. Optimistic Save to LocalStorage
    try {
      const existingLogs = JSON.parse(localStorage.getItem('fitguide_workout_logs') || '[]');
      const updatedLogs = [newLog, ...existingLogs];
      localStorage.setItem('fitguide_workout_logs', JSON.stringify(updatedLogs));

      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('fitguide_workout_logged', { detail: newLog }));
    } catch (err) {
      console.error('Failed to save locally:', err);
    }

    // 2. Background Sync to Supabase
    // Import supabase dynamically or assume it's available if imported at top
    // We'll rely on the import added at the top of the file
    (async () => {
      try {

        // Note: We need to ensure supabase is imported. 
        // Since we can't easily add imports with this tool without replacing the whole file,
        // we'll assume 'supabase' is available if we add the import at the top, 
        // OR we can use the dynamic import pattern if we are unsure.
        // But wait, I can see line 1-5, and supabase is NOT imported.
        // I will add the import in a separate step or use dynamic import here.
        // Let's use dynamic import for safety in this block.
        const { supabase } = await import('../services/supabase');

        const { data: inserted, error } = await Promise.race([
          supabase
            .from('workout_logs')
            .insert({
              user_id: userId,
              exercise_id: 'manual_log',
              exercise_name: `Quick ${logData.type} Session`,
              category: logData.type,
              muscles: [],
              sets: 1,
              reps: `${logData.duration} mins`,
              completed_at: completedAt,
            })
            .select()
            .single(),
          new Promise<{ data: null; error: any }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: { message: 'Timeout' } }), 5000)
          )
        ]);

        if (inserted) {
          // Update local log with real ID
          try {
            const currentLogs = JSON.parse(localStorage.getItem('fitguide_workout_logs') || '[]');
            const updatedLogs = currentLogs.map((log: any) =>
              log.id === tempId ? { ...inserted, created_at: inserted.created_at || completedAt } : log
            );
            localStorage.setItem('fitguide_workout_logs', JSON.stringify(updatedLogs));
          } catch (e) {
            console.warn('Failed to update local log ID', e);
          }
        }
      } catch (err) {
        console.warn('Background sync failed:', err);
      }
    })();

    setShowLogModal(false);
    setShowLogToast(true);
    setTimeout(() => setShowLogToast(false), 3000);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Get user display name
  const displayName = authUser?.user_metadata?.name || user.firstName || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50 relative">
      {showLogToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl z-[300] animate-in slide-in-from-top-10 duration-500 font-black flex items-center gap-3">
          <span>✅</span> Workout Session Saved!
        </div>
      )}
      {notificationToast && (
        <div className="fixed top-24 right-8 bg-white border border-slate-100 text-slate-800 px-6 py-4 rounded-2xl shadow-xl z-[300] animate-in slide-in-from-right-10 duration-300 font-bold flex items-center gap-3">
          <span>🔔</span> No new notifications today!
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full p-6">
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-emerald-500 p-2 rounded-lg text-white font-bold">FG</div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">FitGuide</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentPage === item.id || (item.id === 'dashboard' && currentPage === '')
                ? 'bg-emerald-50 text-emerald-600 font-semibold'
                : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
              {authUser ? userInitial : user.firstName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{displayName}</p>
              <p className="text-xs text-slate-500">{authUser ? authUser.email : 'Guest'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-500 hover:text-red-600 transition-colors font-bold"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {currentPage === 'dashboard' || currentPage === '' ? 'Ready to sweat?' : currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
            </h2>
            <p className="text-slate-500 text-sm">Welcome, {displayName}. Let's hit those goals!</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setNotificationToast(true);
                setTimeout(() => setNotificationToast(false), 3000);
              }}
              className="bg-white p-2.5 rounded-full border border-slate-200 text-slate-600 relative hover:bg-slate-50 transition-colors"
            >
              🔔
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
            </button>
            <button
              onClick={() => setShowLogModal(true)}
              className="bg-slate-900 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg active:scale-95"
            >
              Log Workout
            </button>
          </div>
        </header>

        {children}
      </main>

      {/* Log Workout Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLogModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Quick Log Session</h3>
            <form onSubmit={handleLogSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workout Type</label>
                <select
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  value={logData.type}
                  onChange={(e) => setLogData({ ...logData, type: e.target.value })}
                >
                  <option>Strength</option>
                  <option>Cardio</option>
                  <option>Core</option>
                  <option>Full Body</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration (Minutes)</label>
                <input
                  type="number"
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  value={logData.duration}
                  onChange={(e) => setLogData({ ...logData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`flex flex-col items-center gap-1 ${currentPage === item.id || (item.id === 'dashboard' && currentPage === '')
              ? 'text-emerald-600'
              : 'text-slate-400'
              }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium uppercase tracking-tighter">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;

