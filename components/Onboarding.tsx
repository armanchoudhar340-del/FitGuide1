
import React, { useState } from 'react';
import { UserProfile, Gender, FitnessGoal, WorkoutLocation } from '../types';
import { GYM_EQUIPMENT_LIST } from '../constants';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  initialData?: UserProfile;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialData }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<UserProfile>(initialData || {
    firstName: '',
    lastName: '',
    age: 25,
    gender: Gender.MALE,
    height: 170,
    weight: 65,
    goal: FitnessGoal.STAY_FIT,
    location: WorkoutLocation.GYM,
    availableEquipment: GYM_EQUIPMENT_LIST.map(e => e.id),
  });

  // Calculate total steps for progress indicator
  const totalSteps = formData.location === WorkoutLocation.GYM ? 3 : 2;
  const progressPercentage = (step / totalSteps) * 100;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (formData.age < 13 || formData.age > 100) {
      newErrors.age = 'Age must be between 13 and 100';
    }
    
    if (formData.height < 100 || formData.height > 250) {
      newErrors.height = 'Height must be between 100cm and 250cm';
    }
    
    if (formData.weight < 30 || formData.weight > 300) {
      newErrors.weight = 'Weight must be between 30kg and 300kg';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }
    
    if (formData.location === WorkoutLocation.GYM && step === 1) {
      setStep(2);
    } else {
      onComplete(formData);
    }
  };

  const toggleEquipment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      availableEquipment: prev.availableEquipment.includes(id)
        ? prev.availableEquipment.filter(item => item !== id)
        : [...prev.availableEquipment, id]
    }));
  };

  const inputBaseClass = "w-full px-6 py-4 rounded-2xl border border-slate-800 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all font-bold";

  if (step === 2) {
    return (
      <div className="p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500 max-w-6xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-black text-slate-800">Gym Setup</h3>
            <span className="text-sm font-bold text-slate-500">Step 2 of {totalSteps}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="mb-10 text-center">
            <h4 className="text-3xl font-black text-slate-800 mb-3">🏋️‍♂️ Equipment Selection</h4>
            <p className="text-slate-500 font-bold text-lg mb-2">Select the equipment your gym has available.</p>
            <p className="text-emerald-600 font-black uppercase tracking-widest text-[10px]">Missing equipment will be automatically swapped for dumbbell alternatives.</p>
            <div className="mt-6 bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <p className="text-emerald-700 text-sm font-medium">
                💡 <strong>Pro Tip:</strong> Be honest about your equipment! We'll adapt your workouts accordingly.
              </p>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {GYM_EQUIPMENT_LIST.map((item) => {
            const isSelected = formData.availableEquipment.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleEquipment(item.id)}
                className={`group relative overflow-hidden rounded-[32px] border-4 transition-all duration-300 text-left ${
                  isSelected 
                    ? 'border-emerald-500 shadow-xl shadow-emerald-100 ring-4 ring-emerald-500/10' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className={`w-full h-full object-cover transition-all duration-700 ${isSelected ? 'scale-105' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'}`} 
                  />
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg animate-in zoom-in duration-300">
                      ✓
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-6">
                    <span className="text-3xl mb-1 block">{item.icon}</span>
                    <h4 className="text-white font-black text-xl leading-none">{item.name}</h4>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50 p-6 rounded-[40px] border border-slate-100">
           <button 
             onClick={() => setStep(1)}
             className="w-full sm:w-auto px-10 py-5 bg-white text-slate-500 font-black rounded-[24px] hover:bg-slate-100 transition-all border border-slate-200"
           >
             ← Back to Info
           </button>
           
           <div className="text-center sm:text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Selected</p>
             <p className="text-2xl font-black text-slate-800">{formData.availableEquipment.length} / {GYM_EQUIPMENT_LIST.length}</p>
           </div>

           <button 
             onClick={() => onComplete(formData)}
             className="w-full sm:w-auto bg-slate-900 hover:bg-emerald-600 text-white font-black px-12 py-5 rounded-[24px] shadow-2xl transition-all flex items-center justify-center gap-3 text-lg active:scale-95"
           >
             Generate My Plan ➔
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-black text-slate-800">Welcome to FitGuide</h2>
          <span className="text-sm font-bold text-slate-500">Step {step} of {totalSteps}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Motivational Header */}
      <div className="text-center mb-10">
        <div className="mb-6">
          <div className="text-6xl mb-4">💪</div>
          <h3 className="text-2xl font-black text-slate-800 mb-3">Let's create your perfect workout routine!</h3>
          <p className="text-slate-500 font-bold text-lg mb-4">
            We'll build a personalized plan based on your goals, preferences, and available equipment.
          </p>
          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-200 max-w-md mx-auto">
            <p className="text-emerald-700 text-sm font-medium">
              🚀 <strong>Did you know?</strong> People with personalized workout plans are 3x more likely to achieve their fitness goals!
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">First Name</label>
            <input
              type="text"
              required
              placeholder="Enter first name"
              className={`${inputBaseClass} ${errors.firstName ? 'border-red-500' : ''}`}
              value={formData.firstName}
              onChange={(e) => {
                setFormData({ ...formData, firstName: e.target.value });
                if (errors.firstName) {
                  setErrors({ ...errors, firstName: '' });
                }
              }}
            />
            {errors.firstName && <p className="text-red-500 text-xs font-bold mt-1">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Last Name</label>
            <input
              type="text"
              required
              placeholder="Enter last name"
              className={`${inputBaseClass} ${errors.lastName ? 'border-red-500' : ''}`}
              value={formData.lastName}
              onChange={(e) => {
                setFormData({ ...formData, lastName: e.target.value });
                if (errors.lastName) {
                  setErrors({ ...errors, lastName: '' });
                }
              }}
            />
            {errors.lastName && <p className="text-red-500 text-xs font-bold mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Age</label>
            <input
              type="number"
              required
              className={`${inputBaseClass} ${errors.age ? 'border-red-500' : ''}`}
              value={formData.age}
              onChange={(e) => {
                const age = parseInt(e.target.value) || 0;
                setFormData({ ...formData, age });
                if (errors.age) {
                  setErrors({ ...errors, age: '' });
                }
              }}
            />
            {errors.age && <p className="text-red-500 text-xs font-bold mt-1">{errors.age}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gender</label>
            <select
              className={inputBaseClass + " appearance-none cursor-pointer"}
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
            >
              <option value={Gender.MALE}>Male</option>
              <option value={Gender.FEMALE}>Female</option>
              <option value={Gender.OTHER}>Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Height (cm)</label>
            <input
              type="number"
              required
              className={`${inputBaseClass} ${errors.height ? 'border-red-500' : ''}`}
              value={formData.height}
              onChange={(e) => {
                const height = parseInt(e.target.value) || 0;
                setFormData({ ...formData, height });
                if (errors.height) {
                  setErrors({ ...errors, height: '' });
                }
              }}
            />
            {errors.height && <p className="text-red-500 text-xs font-bold mt-1">{errors.height}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Weight (kg)</label>
            <input
              type="number"
              required
              className={`${inputBaseClass} ${errors.weight ? 'border-red-500' : ''}`}
              value={formData.weight}
              onChange={(e) => {
                const weight = parseInt(e.target.value) || 0;
                setFormData({ ...formData, weight });
                if (errors.weight) {
                  setErrors({ ...errors, weight: '' });
                }
              }}
            />
            {errors.weight && <p className="text-red-500 text-xs font-bold mt-1">{errors.weight}</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-3 block">Fitness Goal</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { goal: FitnessGoal.WEIGHT_LOSS, icon: '📉', title: 'Weight Loss', desc: 'Burn fat & get lean' },
                { goal: FitnessGoal.MUSCLE_GAIN, icon: '💪', title: 'Muscle Gain', desc: 'Build strength & size' },
                { goal: FitnessGoal.STAY_FIT, icon: '⚖️', title: 'Stay Fit', desc: 'Maintain healthy lifestyle' }
              ].map((item) => (
                <button
                  key={item.goal}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal: item.goal })}
                  className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${
                    formData.goal === item.goal
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg'
                      : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  {formData.goal === item.goal && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  <span className="text-3xl">{item.icon}</span>
                  <div className="text-center">
                    <span className="text-sm font-black uppercase tracking-tight block mb-1">{item.title}</span>
                    <span className="text-xs text-slate-500">{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-3 block">Workout Location</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { 
                  loc: WorkoutLocation.HOME, 
                  icon: '🏠', 
                  title: 'Home Workouts', 
                  desc: 'No equipment needed',
                  benefits: ['Flexible schedule', 'No commute', 'Privacy']
                },
                { 
                  loc: WorkoutLocation.GYM, 
                  icon: '🏢', 
                  title: 'Gym Workouts', 
                  desc: 'Full equipment access',
                  benefits: ['Professional machines', 'Group motivation', 'Personal training']
                }
              ].map((item) => (
                <button
                  key={item.loc}
                  type="button"
                  onClick={() => setFormData({ ...formData, location: item.loc })}
                  className={`p-8 rounded-[32px] border-2 transition-all relative overflow-hidden ${
                    formData.location === item.loc
                      ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  {formData.location === item.loc && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-4xl shadow-sm ${
                      formData.location === item.loc ? 'bg-emerald-500 text-white' : 'bg-slate-100'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className={`font-black text-xl mb-2 ${formData.location === item.loc ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {item.title}
                      </h4>
                      <p className={`text-sm mb-3 ${formData.location === item.loc ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {item.desc}
                      </p>
                      <div className="space-y-1">
                        {item.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                            <span className="text-xs text-slate-400">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black py-6 rounded-[32px] shadow-2xl transition-all flex items-center justify-center gap-3 text-lg mt-6 active:scale-95"
        >
          {formData.location === WorkoutLocation.GYM ? 'Next: Equipment Setup' : 'Save Profile & Generate Plan'} ➔
        </button>
      </form>
    </div>
  );
};

export default Onboarding;
