import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage: React.FC = () => {
  const { resetPassword, user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 md:p-12 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-black text-slate-800 mb-4">Check Your Email!</h1>
          <p className="text-slate-500 mb-6">
            We've sent a password reset link to <strong>{email}</strong>.
            Click the link to reset your password.
          </p>
          <Link
            to="/login"
            className="inline-block py-4 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden">
        <div className="p-8 md:p-12">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-2xl font-black text-slate-800">Reset Password</h1>
            <p className="text-slate-500 mt-2">Enter your email to receive a reset link</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-8 text-center">
            <Link to="/login" className="text-slate-500 text-sm hover:text-slate-700 font-bold">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

