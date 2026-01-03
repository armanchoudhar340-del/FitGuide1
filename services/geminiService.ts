
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, BMICategory, WorkoutLocation } from "../types";

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
      model: "gemini-2.0-flash",
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

    const equipmentText = user.location === WorkoutLocation.GYM
      ? `Available Equipment: ${user.availableEquipment.join(', ')}`
      : 'Location: Home (No heavy equipment)';

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
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
  if (user.location === WorkoutLocation.HOME) {
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
      model: "gemini-2.0-flash",
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
      model: 'gemini-2.0-flash',
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

/**
 * Converts a File object to a Format that Gemini can use
 */
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type
    },
  };
}

export const analyzeEquipmentImage = async (imageFile: File) => {
  try {
    console.log("Gemini: Analyzing equipment image...", {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size
    });

    if (!apiKey) {
      console.error("Gemini Error: API key is missing (VITE_API_KEY)");
      return "AI service is not configured. Please add a Gemini API key to use this feature.";
    }

    const imagePart = await fileToGenerativePart(imageFile);

    const prompt = `Identify the gym equipment in this photo. Provide:
    1. Name of the machine/equipment.
    2. Primary muscles targeted.
    3. Step-by-step instructions on how to use it safely.
    4. A "Pro Tip" for better form.
    Format your response with clear headers and emojis. If the image doesn't show gym equipment, politely say so.`;

    console.log("Gemini: Sending request to generateContent (gemini-2.0-flash)...");
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        { text: prompt },
        { inlineData: imagePart.inlineData }
      ] as any
    });

    console.log("Gemini: Analysis successful");
    return response.text;
  } catch (error: any) {
    console.error("Gemini Equipment Analysis Error:", error);

    // Enhanced check for Quota Exceeded - check multiple error properties
    const isQuotaError =
      error?.status === 429 ||
      error?.error?.code === 429 ||
      error?.error?.status === "RESOURCE_EXHAUSTED" ||
      error?.message?.includes("429") ||
      error?.message?.includes("RESOURCE_EXHAUSTED") ||
      error?.message?.includes("quota") ||
      JSON.stringify(error).includes("429") ||
      JSON.stringify(error).includes("RESOURCE_EXHAUSTED");

    if (isQuotaError) {
      console.warn("🎯 Gemini Quota Hit. Providing Mock Response for Demo.");
      return `✨ **AI Scan Result** (Demo Mode)

**Equipment Identified:** Cable Crossover Machine (Functional Trainer)

**Primary Muscles Targeted:**
• Chest (Pectorals)
• Shoulders (Anterior Deltoids)
• Triceps

**How to Use Safely:**
1. Stand in the center of the machine with feet shoulder-width apart
2. Grasp both handles with a neutral or overhand grip
3. Keep a slight bend in your elbows throughout the movement
4. Slowly bring the handles together in front of your chest
5. Control the return to starting position - don't let the weights slam

**💡 Pro Tip:** Focus on the "squeeze" at the center of the movement. This is where maximum chest activation occurs. Keep your core engaged and avoid leaning forward excessively.

---
*⚠️ Demo Mode Active: Your API quota is currently exhausted. Wait 30-60 seconds and try again for a live AI scan!*`;
    }

    if (error instanceof Error) {
      console.error("Error Message:", error.message);
    }
    return "I couldn't analyze the image. Please make sure it shows a clear photo of gym equipment and try again.";
  }
};
