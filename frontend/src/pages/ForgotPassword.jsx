import React, { useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { Loader2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-[#000000] transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gray-200/50 dark:bg-primary-600/10 blur-[120px] pointer-events-none transition-colors" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] rounded-full bg-gray-200/50 dark:bg-purple-600/10 blur-[120px] pointer-events-none transition-colors" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-lightPrimary-500 dark:bg-primary-500 rounded-xl blur shadow-glow shadow-lightPrimary-500/50 dark:shadow-primary-500/50" />
            <div className="relative bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 p-3 rounded-xl transition-colors">
              <Mail className="w-6 h-6 text-lightPrimary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-display font-bold text-center text-black dark:text-white mb-2">Forgot Password</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">Enter your email and we'll send you a reset link.</p>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}
        {sent && <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg text-sm mb-6 text-center">{message}</div>}

        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <input
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:outline-none focus:border-lightPrimary-500 dark:focus:border-primary-500 focus:ring-1 focus:ring-lightPrimary-500 dark:focus:ring-primary-500 transition-all shadow-inner-light"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full relative group disabled:opacity-50 mt-4"
            >
              <div className="absolute inset-0 bg-lightPrimary-600 dark:bg-primary-600 rounded-xl blur shadow-glow shadow-lightPrimary-500/40 dark:shadow-primary-500/40 group-hover:shadow-lightPrimary-500/60 dark:group-hover:shadow-primary-500/60 transition-all" />
              <div className="relative flex items-center justify-center gap-2 bg-lightPrimary-500 hover:bg-lightPrimary-600 dark:bg-primary-600 dark:hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-inner-light">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
              </div>
            </button>
          </form>
        )}

        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-8">
          Remembered it? <Link to="/login" className="text-lightPrimary-600 dark:text-primary-400 hover:text-lightPrimary-500 dark:hover:text-primary-300 transition-colors">Back to Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
