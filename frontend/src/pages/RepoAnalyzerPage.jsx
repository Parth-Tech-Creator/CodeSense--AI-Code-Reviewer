import React, { useState } from 'react';
import api from '../api/axios';
import { GitBranch, Loader2, AlertCircle, FileCode, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RepoAnalyzerPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post('/analyze/repo', { repoUrl: repoUrl.trim() });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to analyze repository. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <header>
        <h1 className="text-3xl font-display font-bold text-black dark:text-white tracking-tight">Repo Review</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Get a high-level architecture review of an entire public GitHub repository.</p>
      </header>

      <div className="glass-panel p-6 rounded-2xl border border-gray-200 dark:border-white/5 flex gap-3 items-center">
        <GitBranch className="w-5 h-5 text-lightPrimary-600 dark:text-primary-400 shrink-0" />
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          placeholder="https://github.com/owner/repo"
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !repoUrl.trim()}
          className="flex items-center gap-2 bg-lightPrimary-500 dark:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Reviewing...' : 'Review Repo'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="flex-1 glass-panel rounded-3xl flex flex-col items-center justify-center text-gray-500 border border-gray-200 dark:border-white/5">
          <GitBranch className="w-16 h-16 opacity-20 mb-4" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Paste a public GitHub repo URL above to get started.</p>
          <p className="text-sm mt-1">A handful of representative source files will be pulled and reviewed together.</p>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">
          <div className="flex items-center gap-4 bg-white dark:bg-dark-800/50 p-6 rounded-2xl border border-gray-200 dark:border-white/5">
            <div className="w-20 h-20 rounded-full border-4 border-lightPrimary-500 dark:border-primary-500 flex items-center justify-center shadow-glow shadow-lightPrimary-500/30 dark:shadow-primary-500/30 shrink-0">
              <span className="text-2xl font-bold text-black dark:text-white">{result.overallScore}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-1">{result.repo}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Reviewed {result.filesAnalyzed?.length || 0} files: {result.filesAnalyzed?.join(', ')}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800/50 p-5 rounded-2xl border border-gray-200 dark:border-white/5">
            <h4 className="text-black dark:text-white font-semibold mb-3 border-b border-gray-200 dark:border-white/5 pb-2">Architecture Summary</h4>
            <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed">{result.architectureSummary}</p>
          </div>

          {result.topRisks?.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-200 dark:border-red-500/20">
              <h4 className="text-red-600 dark:text-red-400 font-semibold mb-3 border-b border-red-200 dark:border-red-500/10 pb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Top Risks
              </h4>
              <ul className="space-y-2 list-disc list-inside text-sm text-gray-800 dark:text-gray-300">
                {result.topRisks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {result.fileReviews?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-black dark:text-white font-semibold flex items-center gap-2">
                <FileCode className="w-4 h-4" /> Per-File Review
              </h4>
              {result.fileReviews.map((fr, i) => (
                <div key={i} className="bg-white dark:bg-dark-800/50 p-4 rounded-xl border border-gray-200 dark:border-white/5">
                  <p className="text-sm font-mono text-lightPrimary-600 dark:text-primary-400 mb-2">{fr.file}</p>
                  {fr.issues?.length > 0 && (
                    <ul className="space-y-1 list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {fr.issues.map((iss, ii) => <li key={ii}>{iss}</li>)}
                    </ul>
                  )}
                  {fr.suggestion && <p className="text-sm text-green-600 dark:text-green-400">Suggestion: {fr.suggestion}</p>}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
