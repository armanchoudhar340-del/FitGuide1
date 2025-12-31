
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, BMICategory } from "../types";

// The API key is obtained from Vite environment variables for browser compatibility
// The API key is obtained from Vite environment variables for browser compatibility
const apiKey = import.meta.env.VITE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const getFitnessInsight = async (user: UserProfile, bmiScore: number, bmiCategory: BMICategory) => {
  try {
    if (!apiKey) {
      console.warn("No API key found for Gemini service");
      return getDefaultInsight(user, bmiCategory);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, encouraging fitness insight for a ${user.age} year old ${user.gender} aiming for ${user.goal}. 
      BMI is ${bmiScore.toFixed(1)} (${bmiCategory}). 
      Workout Location: ${user.location}. 
      Limit to 2-3 sentences.`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return getDefaultInsight(user, bmiCategory);
  }
};

const getDefaultInsight = (user: UserProfile, bmiCategory: BMICategory): string => {
  const insights = [
    "Great job! Keep staying active and focused on your goals. Consistency is key!",
    "Remember, progress takes time. Focus on form over intensity!",
    "You're making great progress. Stay hydrated and get enough rest!",
    "Every workout counts! Keep pushing yourself within your limits.",
    "Listen to your body and celebrate small wins along the way!"
  ];

  if (bmiCategory === BMICategory.UNDERWEIGHT) {
    return "Focus on strength training and eating enough to build muscle mass!";
  } else if (bmiCategory === BMICategory.OVERWEIGHT) {
    return "Combine cardio with strength training for optimal weight loss results!";
  }

  return insights[Math.floor(Math.random() * insights.length)];
};

export const generateAiWorkoutRoutine = async (user: UserProfile, bmiCategory: string) => {
  try {
    if (!apiKey) {
      console.warn("No API key found for Gemini service");
      return getDefaultWorkoutRoutine(user, bmiCategory);
    }

    const equipmentText = user.location === 'Gym'
      ? `Available Equipment: ${user.availableEquipment.join(', ')}`
      : 'Location: Home (No heavy equipment)';

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `As a world-class personal trainer, generate a custom daily workout routine for a beginner.
      User Profile: ${user.age}yr old ${user.gender}, Goal: ${user.goal}, BMI Status: ${bmiCategory}.
      ${equipmentText}.
      
      Requirements:
      1. Provide 5-6 exercises.
      2. For each, include Name, Sets, Reps, and a "Coach Tip" on form.
      3. Format it clearly with emojis.
      4. Ensure it fits their equipment. If they are at home, use bodyweight only.
      5. Add a 1-sentence motivation at the end.`,
      config: {
        temperature: 0.8,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Workout Generation Error:", error);
    return getDefaultWorkoutRoutine(user, bmiCategory);
  }
};

const getDefaultWorkoutRoutine = (user: UserProfile, bmiCategory: string): string => {
  if (user.location === 'Home') {
    return `🏠 **Home Workout Routine**

1. **Push-ups** - 3 sets of 10-15 reps
   Coach Tip: Keep your body in a straight line, don't let your hips sag!

2. **Bodyweight Squats** - 3 sets of 15 reps
   Coach Tip: Go as low as comfortable, keep your weight on your heels.

3. **Plank Hold** - 3 sets of 30-60 seconds
   Coach Tip: Engage your core, don't let your hips drop!

4. **Mountain Climbers** - 3 sets of 20 reps
   Coach Tip: Keep your core tight and drive your knees to your chest.

5. **Burpees** - 3 sets of 8-10 reps
   Coach Tip: Focus on proper form over speed. You've got this! 💪

**Motivation:** Every rep brings you closer to your goals. Stay consistent!`;
  } else {
    return `💪 **Gym Workout Routine**

1. **Lat Pulldowns** - 3 sets of 10-12 reps
   Coach Tip: Focus on squeezing your lats, don't just use your arms.

2. **Seated Rows** - 3 sets of 12 reps
   Coach Tip: Keep your chest up and pull to your waistline.

3. **Bench Press** - 3 sets of 8-10 reps
   Coach Tip: Keep your feet planted and control the bar down.

4. **Leg Press** - 3 sets of 12-15 reps
   Coach Tip: Don't go too deep, keep your glutes on the seat.

5. **Shoulder Press** - 3 sets of 10 reps
   Coach Tip: Start with lighter weight to master the form.

**Motivation:** Great choice using the gym! Make every rep count! 🏋️`;
  }
};

export const generateMealPlan = async (user: UserProfile) => {
  try {
    if (!apiKey) {
      return "Focus on whole foods, lean proteins, and plenty of greens. Try to eat every 3-4 hours to keep your energy stable!";
    }
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a professional nutritionist, generate a 1-day sample meal plan for a ${user.age} year old ${user.gender} who wants to ${user.goal}. 
      Height: ${user.height}cm, Weight: ${user.weight}kg. 
      Format the response with headers for Breakfast, Lunch, Snack, and Dinner. Keep it concise and beginner-friendly.`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Meal Plan Error:", error);
    return "Focus on whole foods, lean proteins, and plenty of greens. Try to eat every 3-4 hours to keep your energy stable!";
  }
};

export const chatWithFitGuide = async (history: { role: 'user' | 'model', message: string }[]) => {
  try {
    if (!apiKey) {
      return "I'm sorry, I can't chat right now as the AI service is not configured. Please check back later!";
    }
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'You are FitGuide Assistant, a friendly fitness coach for beginners. Provide simple, safe, and effective advice on gym machines, home workouts, and basic nutrition. Always encourage proper form.',
      },
    });

    const lastMessage = history[history.length - 1];
    const response = await chat.sendMessage({ message: lastMessage.message });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Let's focus on your workout plan!";
  }
};
