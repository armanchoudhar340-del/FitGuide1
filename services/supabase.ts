import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxxwusnnzhlbqrtqzoiq.supabase.co';
const supabaseKey = 'sb_publishable_cZgUdEV79SLpiD5ILx3pVw_eekeAg6e';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types for TypeScript
export interface WorkoutLog {
  id: string;
  user_id?: string;
  exercise_id: string;
  exercise_name: string;
  category: string;
  muscles: string[];
  sets: number;
  reps: string;
  completed_at: string;
  created_at?: string;
}

export interface UserProfile {
  id?: string;
  email?: string;
  name?: string;
  height: number;
  weight: number;
  location: 'GYM' | 'HOME';
  available_equipment?: string[];
  created_at?: string;
  updated_at?: string;
}

// Helper functions for workout logs
export const workoutLogsService = {
  // Get all workout logs for a user
  async getAll(userId?: string): Promise<WorkoutLog[]> {
    let query = supabase
      .from('workout_logs')
      .select('*')
      .order('completed_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get workout logs within a date range
  async getByDateRange(startDate: string, endDate: string, userId?: string): Promise<WorkoutLog[]> {
    let query = supabase
      .from('workout_logs')
      .select('*')
      .gte('completed_at', startDate)
      .lte('completed_at', endDate)
      .order('completed_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Create a new workout log
  async create(log: Omit<WorkoutLog, 'id' | 'created_at'>): Promise<WorkoutLog> {
    const { data, error } = await supabase
      .from('workout_logs')
      .insert(log)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a workout log
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('workout_logs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Clear all workout logs
  async clearAll(userId?: string): Promise<void> {
    let query = supabase.from('workout_logs').delete();
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { error } = await query;
    if (error) throw error;
  },

  // Get workout statistics
  async getStats(userId?: string) {
    let query = supabase
      .from('workout_logs')
      .select('category', { count: 'exact', head: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    const logs = data || [];
    return {
      totalWorkouts: logs.length,
      strengthCount: logs.filter(l => l.category === 'Strength').length,
      cardioCount: logs.filter(l => l.category === 'Cardio').length,
      coreCount: logs.filter(l => l.category === 'Core').length,
    };
  },
};

// User profile service
export const userProfileService = {
  // Get user profile
  async get(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create or update user profile
  async upsert(profile: UserProfile): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

