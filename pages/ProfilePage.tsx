import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { WorkoutLocation } from '../types';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  height: number;
  weight: number;
  location: string;
  available_equipment: string[];
}

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [location, setLocation] = useState<'GYM' | 'HOME'>('GYM');
  const [equipment, setEquipment] = useState<string[]>([]);

  const equipmentOptions = [
    'Dumbbells',
    'Barbell',
    'Kettlebell',
    'Resistance Bands',
    'Pull-up Bar',
    'Bench',
    'Treadmill',
    'Stationary Bike',
    'Rowing Machine',
    'Cable Machine',
  ];

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setName(data.name || '');
        setHeight(data.height || 170);
        setWeight(data.weight || 70);
        setLocation(data.location || 'GYM');
        setEquipment(data.available_equipment || []);
      } else {
        // Create default profile
        const defaultProfile = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || '',
          height: 170,
          weight: 70,
          location: 'GYM',
          available_equipment: [],
        };
        setProfile(defaultProfile);
        setName(defaultProfile.name);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const updatedProfile = {
        id: user.id,
        email: user.email || profile?.email || '',
        name,
        height,
        weight,
        location,
        available_equipment: equipment,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(updatedProfile);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error saving profile' });
    } finally {
      setSaving(false);
    }
  };

  const toggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      setEquipment(equipment.filter((e) => e !== item));
    } else {
      setEquipment([...equipment, item]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white p-12 rounded-[32px] border border-slate-100 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-black text-slate-800 mb-2">Sign In Required</h3>
        <p className="text-slate-500 mb-6">Sign in to view and edit your profile</p>
        <a
          href="/login"
          className="inline-block py-4 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all"
        >
          Sign In
        </a>
      </div>
    );
  }

  const bmi = weight / ((height / 100) * (height / 100));
  const bmiCategory =
    bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : 'Overweight';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100">
        <h2 className="text-2xl font-black text-slate-800 mb-2">👤 Profile</h2>
        <p className="text-slate-500 text-sm">Manage your account and preferences</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`px-6 py-4 rounded-2xl font-bold ${
            message.type === 'success'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Info Card */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-3xl text-white font-black">
            {name.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">{name || 'User'}</h3>
            <p className="text-slate-500">{user.email}</p>
          </div>
        </div>

        {/* BMI Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-[24px] text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold opacity-80">BMI</p>
              <p className="text-3xl font-black">{bmi.toFixed(1)}</p>
              <p className="text-sm font-bold">{bmiCategory}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold opacity-80">{height}cm / {weight}kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100">
        <h3 className="text-lg font-black text-slate-800 mb-6">Edit Profile</h3>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Workout Location</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLocation('GYM')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                  location === 'GYM'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🏋️ Gym
              </button>
              <button
                type="button"
                onClick={() => setLocation('HOME')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                  location === 'HOME'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🏠 Home
              </button>
            </div>
          </div>

          {/* Equipment */}
          {location === 'GYM' && (
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Available Equipment</label>
              <div className="flex flex-wrap gap-2">
                {equipmentOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleEquipment(item)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      equipment.includes(item)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl shadow-lg transition-all disabled:opacity-50 mt-6"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100">
        <button
          onClick={signOut}
          className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;

