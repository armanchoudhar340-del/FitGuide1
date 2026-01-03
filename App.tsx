import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserProfile, Gender, FitnessGoal, WorkoutLocation } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import Onboarding from './components/Onboarding';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import WorkoutView from './components/WorkoutView';
import NutritionView from './components/NutritionView';
import ProgressView from './components/ProgressView';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import ScannerPage from './pages/ScannerPage';
import NotFound from './pages/NotFound';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 font-bold text-slate-400">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main App Content
const AppContent: React.FC = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('fitguide_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else if (authUser) {
      // Load user profile from Supabase
      loadUserProfile();
    }
    setIsLoaded(true);
  }, [authUser]);

  const loadUserProfile = async () => {
    if (!authUser) return;

    try {
      const { data } = await (await import('./services/supabase'))
        .supabase.from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data) {
        const userProfile: UserProfile = {
          id: data.id,
          email: data.email,
          firstName: data.name?.split(' ')[0] || '',
          lastName: data.name?.split(' ').slice(1).join(' ') || '',
          height: data.height,
          weight: data.weight,
          location: data.location as WorkoutLocation,
          availableEquipment: data.available_equipment || [],
        };
        setUser(userProfile);
        localStorage.setItem('fitguide_user', JSON.stringify(userProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleProfileUpdate = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('fitguide_user', JSON.stringify(profile));
    navigate('/dashboard');
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 font-bold text-slate-400">
        Loading FitGuide...
      </div>
    );
  }

  // If no user profile exists, show onboarding
  if (!user) {
    return <Onboarding onComplete={handleProfileUpdate} />;
  }

  return (
    <Layout user={user}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              user={user}
              onStartSession={(filter, muscle) => {
                const params = new URLSearchParams();
                if (filter) params.set('filter', filter);
                if (muscle) params.set('muscle', muscle);
                navigate(`/workouts?${params.toString()}`);
              }}
            />
          }
        />
        <Route path="/workouts" element={<WorkoutView user={user} />} />
        <Route path="/progress" element={<ProgressView />} />
        <Route path="/nutrition" element={<NutritionView user={user} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Main App Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

