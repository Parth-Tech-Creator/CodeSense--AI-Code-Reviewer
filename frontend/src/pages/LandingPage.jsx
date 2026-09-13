import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, Code2, Bug, GitBranch, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { user, loading } = useContext(AuthContext);

  if (!loading && user) return <Navigate to="/home" />;

  const features = [
    { icon: <Code2 className="w-5 h-5" />, title: 'Instant Code Analysis', desc: 'Get a 0-100 score on correctness, efficiency, readability and best practices.' },
    { icon: <Bug className="w-5 h-5" />, title: 'Bug Detection', desc: 'Find real bugs with line numbers and concrete fixes, not vague warnings.' },
    { icon: <GitBranch className="w-5 h-5" />, title: 'Repo-Wide Review', desc: 'Paste a GitHub repo link and get an architecture-level review across files.' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-gray-200/50 dark:bg-primary-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[45%] rounded-full bg-gray-200/50 dark:bg-purple-600/10 blur-[120px] pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-lightPrimary-500 dark:bg-primary-500 rounded-xl blur shadow-glow shadow-lightPrimary-500/50 dark:shadow-primary-500/50" />
            <div className="relative bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 p-2 rounded-xl">
              <Sparkles className="w-5 h-5 text-lightPrimary-600 dark:text-primary-400" />
            </div>
          </div>
          <span className="font-display font-bold text-black dark:text-white text-lg">CodeSensei</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">Log in</Link>
          <Link to="/register" className="text-sm font-medium bg-lightPrimary-500 dark:bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-lightPrimary-600 dark:hover:bg-primary-500 transition-colors">Sign up</Link>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-20 pb-24">
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-display font-bold text-black dark:text-white tracking-tight mb-6"
        >
          Your AI senior engineer, <br className="hidden md:block" /> on call for every commit.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10"
        >
          CodeSensei scores your code, finds real bugs, explains complexity, refactors it for you, and quizzes you like a technical interviewer — all in seconds.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4"
        >
          <Link to="/register" className="relative group">
            <div className="absolute inset-0 bg-lightPrimary-600 dark:bg-primary-600 rounded-xl blur shadow-glow shadow-lightPrimary-500/40 dark:shadow-primary-500/40 group-hover:shadow-lightPrimary-500/60 dark:group-hover:shadow-primary-500/60 transition-all" />
            <div className="relative flex items-center gap-2 bg-lightPrimary-500 dark:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
          <Link to="/login" className="px-6 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            I already have an account
          </Link>
        </motion.div>
      </main>

      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
            className="glass-panel p-6 rounded-2xl border border-gray-200 dark:border-white/5"
          >
            <div className="w-10 h-10 rounded-xl bg-lightPrimary-500/10 dark:bg-primary-600/20 flex items-center justify-center text-lightPrimary-600 dark:text-primary-400 mb-4">
              {f.icon}
            </div>
            <h3 className="font-semibold text-black dark:text-white mb-2">{f.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
