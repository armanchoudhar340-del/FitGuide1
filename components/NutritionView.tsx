
import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { generateMealPlan } from '../services/geminiService';

interface MealEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  time: string;
}

interface DailyProgress {
  calories: number;
  protein: number;
  carbs: number;
}

interface NutritionViewProps {
  user: UserProfile;
}

const ProgressBar: React.FC<{
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: string;
}> = ({ label, current, target, unit, color, icon }) => {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-xl`}>
            {icon}
          </div>
          <div>
            <p className="text-slate-800 font-black text-lg">{label}</p>
            <p className="text-slate-400 text-sm font-medium">
              {current} / {target} {unit}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-slate-800">{Math.round(percentage)}%</p>
          <p className="text-xs text-slate-400 font-medium">
            {current > target ? '+' : ''}{current - target} {unit}
          </p>
        </div>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ease-out ${color.replace('bg-', 'bg-').replace('-100', '-500')}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {current > target && (
        <div className="mt-2 text-right">
          <span className="text-orange-600 text-xs font-bold bg-orange-100 px-2 py-1 rounded-full">
            Over target
          </span>
        </div>
      )}
    </div>
  );
};

const NutritionView: React.FC<NutritionViewProps> = ({ user }) => {
  const [mealPlan, setMealPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMealData, setNewMealData] = useState({ name: '', calories: '', protein: '', carbs: '' });

  const handleCustomMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddMeal({
      name: newMealData.name,
      calories: parseInt(newMealData.calories) || 0,
      protein: parseInt(newMealData.protein) || 0,
      carbs: parseInt(newMealData.carbs) || 0,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
    setNewMealData({ name: '', calories: '', protein: '', carbs: '' });
  };

  // Calculate daily targets based on user profile
  const dailyTargets = useMemo(() => {
    // Basic BMR calculation (Mifflin-St Jeor Equation)
    const bmr = user.gender === 'Male'
      ? 10 * user.weight + 6.25 * user.height - 5 * user.age + 5
      : 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;

    // Adjust for activity level and goal
    let calorieTarget = bmr * 1.55; // Moderate activity

    switch (user.goal) {
      case 'Weight Loss':
        calorieTarget -= 500; // 500 calorie deficit
        break;
      case 'Muscle Gain':
        calorieTarget += 300; // 300 calorie surplus
        break;
      case 'Stay Fit':
      default:
        break;
    }

    return {
      calories: Math.round(calorieTarget),
      protein: Math.round(user.weight * 1.6), // 1.6g per kg body weight
      carbs: Math.round((calorieTarget * 0.45) / 4), // 45% of calories from carbs
      fats: Math.round((calorieTarget * 0.25) / 9) // 25% of calories from fats
    };
  }, [user]);

  // Calculate current progress
  const currentProgress = useMemo((): DailyProgress => {
    return meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs
    }), { calories: 0, protein: 0, carbs: 0 });
  }, [meals]);

  const remaining = {
    calories: dailyTargets.calories - currentProgress.calories,
    protein: dailyTargets.protein - currentProgress.protein,
    carbs: dailyTargets.carbs - currentProgress.carbs
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    const plan = await generateMealPlan(user);
    setMealPlan(plan);
    setLoading(false);
  };

  const handleAddMeal = (newMeal: Omit<MealEntry, 'id'>) => {
    const meal: MealEntry = {
      ...newMeal,
      id: Date.now().toString()
    };
    setMeals(prev => [...prev, meal]);
    setShowAddMeal(false);
  };

  const handleDeleteMeal = (id: string) => {
    setMeals(prev => prev.filter(meal => meal.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-orange-400 to-rose-500 p-8 md:p-12 rounded-[50px] text-white shadow-xl shadow-orange-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="max-w-4xl relative z-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Fuel your progress.</h3>
              <p className="text-orange-50 mb-8 opacity-90 leading-relaxed text-lg">
                Your goals are achieved in the kitchen as much as in the gym. Based on your profile, we've calculated your daily needs.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
                  <p className="text-2xl font-black">{currentProgress.calories}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Consumed</p>
                </div>
                <div className="text-orange-100 text-3xl font-black">/</div>
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
                  <p className="text-2xl font-black">{dailyTargets.calories}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Target</p>
                </div>
                <div className={`text-center ${remaining.calories >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  <p className="text-xl font-black">{remaining.calories >= 0 ? remaining.calories : Math.abs(remaining.calories)}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{remaining.calories >= 0 ? 'Remaining' : 'Over'}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-[300px]">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-[24px] border border-white/20 text-center">
                <p className="text-lg font-black">{currentProgress.protein}g</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Protein</p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div
                    className="bg-emerald-300 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((currentProgress.protein / dailyTargets.protein) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-[24px] border border-white/20 text-center">
                <p className="text-lg font-black">{currentProgress.carbs}g</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Carbs</p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div
                    className="bg-yellow-300 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((currentProgress.carbs / dailyTargets.carbs) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-[24px] border border-white/20 text-center">
                <p className="text-lg font-black">{dailyTargets.fats}g</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Fats</p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-300 h-2 rounded-full transition-all duration-700"
                    style={{ width: '60%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProgressBar
          label="Calories"
          current={currentProgress.calories}
          target={dailyTargets.calories}
          unit="kcal"
          color="bg-orange-100"
          icon="🔥"
        />
        <ProgressBar
          label="Protein"
          current={currentProgress.protein}
          target={dailyTargets.protein}
          unit="g"
          color="bg-emerald-100"
          icon="💪"
        />
        <ProgressBar
          label="Carbohydrates"
          current={currentProgress.carbs}
          target={dailyTargets.carbs}
          unit="g"
          color="bg-yellow-100"
          icon="🍞"
        />
      </div>

      {/* Today's Meals */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-2xl font-black text-slate-800">Today's Meals</h4>
            <p className="text-slate-500">Track your nutrition throughout the day</p>
          </div>
          <button
            onClick={() => setShowAddMeal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            ➕ Add Meal
          </button>
        </div>

        <div className="space-y-4">
          {meals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h5 className="text-xl font-black text-slate-800 mb-2">No meals logged today</h5>
              <p className="text-slate-500 mb-6">Start tracking your nutrition to stay on target!</p>
              <button
                onClick={() => setShowAddMeal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black transition-all"
              >
                Log Your First Meal
              </button>
            </div>
          ) : (
            meals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px] border border-slate-100 hover:bg-slate-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-bold">
                    {meal.time}
                  </div>
                  <div>
                    <h6 className="font-black text-slate-800 text-lg">{meal.name}</h6>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{meal.calories} kcal</span>
                      <span>{meal.protein}g protein</span>
                      <span>{meal.carbs}g carbs</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMeal(meal.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Add Meals */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100">
        <h4 className="text-xl font-black text-slate-800 mb-6">Quick Add</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Banana', calories: 105, protein: 1, carbs: 27 },
            { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0 },
            { name: 'Almonds (28g)', calories: 164, protein: 6, carbs: 6 },
            { name: 'Protein Shake', calories: 150, protein: 25, carbs: 5 }
          ].map((food, i) => (
            <button
              key={i}
              onClick={() => handleAddMeal({
                name: food.name,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              })}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-all text-left"
            >
              <p className="font-bold text-slate-800 mb-1">{food.name}</p>
              <p className="text-sm text-slate-500">{food.calories} kcal • {food.protein}g protein</p>
            </button>
          ))}
        </div>
      </div>

      {/* Nutrition Education Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: '🥩', title: 'High Protein', desc: 'Essential for muscle repair and growth after heavy sessions.' },
          { icon: '🥬', title: 'Fiber Rich', desc: 'Keeps you full and improves digestion for steady energy.' },
          { icon: '🥑', title: 'Healthy Fats', desc: 'Vital for hormone balance and nutrient absorption.' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:translate-y-[-8px] transition-all duration-500">
            <div className="text-5xl mb-8">{item.icon}</div>
            <h4 className="text-2xl font-black text-slate-800 mb-3">{item.title}</h4>
            <p className="text-slate-500 text-base leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <section className="bg-slate-900 rounded-[50px] p-8 md:p-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=2064&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="relative z-10">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-6">AI Personal Nutritionist</h3>
          <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
            Need inspiration? Our AI can generate a professional 1-day meal plan tailored specifically for your BMI and ${user.goal} goal.
          </p>

          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className={`bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-5 rounded-[24px] font-black shadow-2xl transition-all text-lg flex items-center gap-3 mx-auto ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Consulting Chef...' : 'Generate Meal Plan ✨'}
          </button>

          {mealPlan && (
            <div className="mt-12 bg-white text-slate-800 p-8 md:p-12 rounded-[40px] text-left max-w-4xl mx-auto shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                <h4 className="text-2xl font-black text-slate-900">Your Tailored Meal Plan</h4>
                <button onClick={() => setMealPlan(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="prose prose-slate max-w-none">
                {mealPlan.split('\n').map((line, i) => (
                  <p key={i} className="mb-4 text-lg text-slate-600 leading-relaxed">
                    {line.startsWith('#') || line.startsWith('**') ? <strong>{line.replace(/\*|#/g, '')}</strong> : line}
                  </p>
                ))}
              </div>
              <div className="mt-10 p-6 bg-emerald-50 rounded-[24px] border border-emerald-100 flex items-center gap-4 text-emerald-700">
                <span className="text-2xl">💧</span>
                <p className="text-sm font-bold">Don't forget to drink at least 3L of water today!</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Add Custom Meal Modal */}
      {showAddMeal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddMeal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-800 mb-6">Add Custom Meal</h3>
            <form onSubmit={handleCustomMealSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meal Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  placeholder="e.g. Oatmeal"
                  value={newMealData.name}
                  onChange={(e) => setNewMealData({ ...newMealData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cals</label>
                  <input
                    type="number"
                    required
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                    placeholder="0"
                    value={newMealData.calories}
                    onChange={(e) => setNewMealData({ ...newMealData, calories: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protein</label>
                  <input
                    type="number"
                    required
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                    placeholder="0g"
                    value={newMealData.protein}
                    onChange={(e) => setNewMealData({ ...newMealData, protein: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carbs</label>
                  <input
                    type="number"
                    required
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                    placeholder="0g"
                    value={newMealData.carbs}
                    onChange={(e) => setNewMealData({ ...newMealData, carbs: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMeal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100"
                >
                  Add Meal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionView;
