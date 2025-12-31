
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum FitnessGoal {
  WEIGHT_LOSS = 'Weight Loss',
  MUSCLE_GAIN = 'Muscle Gain',
  STAY_FIT = 'Stay Fit'
}

export enum WorkoutLocation {
  GYM = 'Gym',
  HOME = 'Home'
}

export enum BMICategory {
  UNDERWEIGHT = 'Underweight',
  NORMAL = 'Normal',
  OVERWEIGHT = 'Overweight',
  OBESE = 'Obese'
}

export interface UserProfile {
  // Optional fields populated when a user signs up or when loaded from profile
  id?: string;
  email?: string;
  firstName: string;
  lastName: string;
  age?: number;
  gender?: Gender;
  height: number; // in cm
  weight: number; // in kg
  goal?: FitnessGoal;
  location: WorkoutLocation;
  availableEquipment: string[]; // List of IDs/Names of equipment the user has access to
}

export interface Exercise {
  id: string;
  name: string;
  muscles: string[];
  sets: number;
  reps: string;
  instruction: string;
  image: string;
  category: 'Strength' | 'Cardio' | 'Core';
  location: WorkoutLocation[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipmentRequired?: string; // The specific machine needed
  isReplacement?: boolean; // If this is a dumbbell/bodyweight alternative
  replacesId?: string; // ID of the machine exercise it replaces
}

export interface BMIInfo {
  score: number;
  category: BMICategory;
  idealRange: { min: number; max: number };
  message: string;
}

export interface WorkoutLog {
  id: string;
  user_id?: string;
  exercise_id: string;
  exercise_name: string;
  category: 'Strength' | 'Cardio' | 'Core';
  muscles: string[];
  sets: number;
  reps: string;
  completed_at: string; // ISO date string
  created_at?: string;
  duration?: number; // seconds spent on exercise
}

export interface WorkoutSummary {
  date: string;
  totalExercises: number;
  strengthCount: number;
  cardioCount: number;
  coreCount: number;
  workouts: WorkoutLog[];
}
