import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Code2, GitBranch, History, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { user } = useContext(AuthContext);

  const actions = [
    { title: 'Analyze Code', desc: 'Paste a snippet and get a full score, bugs, refactor and test cases.', icon: <Code2 className="w-5 h-5" />, to: '/analyze' },
    { title: 'Repo Review', desc: 'Get an architecture-level review of an entire GitHub repository.', icon: <GitBranch className="w-5 h-5" />, to: '/repo-review' },
    { title: 'View History', desc: 'See your past analyses and track your score over time.', icon: <History className="w-5 h-5" />, to: '/dashboard' },
  ];

  return (
    <div className="h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-black dark:text-white tracking-tight">Welcome back{user?.name ? `, ${user.name}` : ''} 👋</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">What would you like to do today?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((a, i) => (
          <motion.div
            key={a.to}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          >
            <Link to={a.to} className="glass-panel p-6 rounded-2xl border border-gray-200 dark:border-white/5 hover:bg-white dark:hover:bg-dark-800/80 transition-all group flex flex-col h-full">
              <div className="w-10 h-10 rounded-xl bg-lightPrimary-500/10 dark:bg-primary-600/20 flex items-center justify-center text-lightPrimary-600 dark:text-primary-400 mb-4">
                {a.icon}
              </div>
              <h3 className="font-semibold text-black dark:text-white mb-2">{a.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">{a.desc}</p>
              <span className="flex items-center gap-1 text-sm font-medium text-lightPrimary-600 dark:text-primary-400 group-hover:gap-2 transition-all">
                Open <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
