-- 1. Enable UUID extension (required for generating unique IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create user_profiles table
-- We use TEXT for id to match Supabase Auth user IDs
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  height NUMERIC DEFAULT 170,
  weight NUMERIC DEFAULT 70,
  location TEXT DEFAULT 'GYM',
  available_equipment TEXT[],
  age INTEGER,
  gender TEXT,
  goal TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create workout_logs table
-- user_id is TEXT to support both logged-in users (UUIDs) and guest users (device_ IDs)
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  category TEXT NOT NULL,
  muscles TEXT[],
  sets INTEGER,
  reps TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON public.workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_completed_at ON public.workout_logs(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- 5. Disable Row Level Security (RLS) to prevent "permission denied" errors
-- This ensures your app can read/write data freely.
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs DISABLE ROW LEVEL SECURITY;

-- 6. (Optional) Grant permissions to authenticated and anonymous users
-- This is a fallback in case RLS is enabled in the future
GRANT ALL ON public.user_profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.workout_logs TO postgres, anon, authenticated, service_role;
