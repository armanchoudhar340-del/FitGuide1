import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

// Generate or retrieve a device ID for anonymous users
const getDeviceId = () => {
  let deviceId = localStorage.getItem('fitguide_device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('fitguide_device_id', deviceId);
  }
  return deviceId;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session with timeout
    const initSession = async () => {
      try {
        const { data } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: null } }>((resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 2000)
          )
        ]);

        const session = data?.session ?? null;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const deviceId = getDeviceId();
          if (deviceId.startsWith('device_')) {
            await migrateWorkouts(session.user.id);
          }
        }
      } catch (err) {
        console.warn('Error initializing auth session:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // If user just logged in, migrate workouts
      if (session?.user) {
        const deviceId = getDeviceId();
        if (deviceId.startsWith('device_')) {
          await migrateWorkouts(session.user.id);
        }
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Attempting to sign up:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Create user profile
      if (data?.user) {
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
              id: data.user.id,
              email,
              name,
              height: 170,
              weight: 70,
              location: 'GYM',
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        } catch (e) {
          console.warn('Profile creation failed but user created:', e);
        }

        // Automatically sign in the user after successful registration
        await signIn(email, password);
      }

      return { error: null };
    } catch (err: any) {
      console.error('Signup error:', err);
      return { error: { message: err.message || 'An unexpected error occurred' } as any };
    }
  };

  // Migrate workouts from anonymous device ID to authenticated user ID
  const migrateWorkouts = async (userId: string) => {
    const deviceId = getDeviceId();

    if (!deviceId.startsWith('device_')) {
      return; // No anonymous workouts to migrate
    }

    try {
      // Fetch all workouts logged under the anonymous device ID
      const { data: anonymousLogs, error: fetchError } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', deviceId);

      if (fetchError) {
        console.error('Error fetching anonymous workouts:', fetchError);
        return;
      }

      if (!anonymousLogs || anonymousLogs.length === 0) {
        return; // No anonymous workouts to migrate
      }

      // Update all anonymous logs to use the authenticated user ID
      const { error: updateError } = await supabase
        .from('workout_logs')
        .update({ user_id: userId })
        .eq('user_id', deviceId);

      if (updateError) {
        console.error('Error migrating workouts:', updateError);
        return;
      }

      // Also migrate localStorage workouts
      const localLogs = localStorage.getItem('fitguide_workout_logs');
      if (localLogs) {
        const parsedLogs = JSON.parse(localLogs);
        const updatedLogs = parsedLogs.map((log: any) => ({
          ...log,
          user_id: userId
        }));
        localStorage.setItem('fitguide_workout_logs', JSON.stringify(updatedLogs));
      }

      // Clear the old device ID from localStorage after successful migration
      localStorage.removeItem('fitguide_device_id');

      // Dispatch event to notify other components about the migration
      window.dispatchEvent(new Event('fitguide_workouts_migrated'));

      console.log(`Successfully migrated ${anonymousLogs.length} workouts to user ${userId}`);
    } catch (err) {
      console.error('Error during workout migration:', err);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        // After successful login, migrate any anonymous workouts to the authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await migrateWorkouts(user.id);
        }
      }

      return { error };
    } catch (err: any) {
      return { error: { message: err.message || 'An unexpected error occurred' } as any };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

