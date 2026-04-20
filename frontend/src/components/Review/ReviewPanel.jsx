import { useState, useEffect } from 'react';
import {
  Bug, Zap, Shield, Sparkles, GitCompare, Download,
  AlertCircle, CheckCircle, RefreshCw, Clock, ExternalLink, FlaskConical
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import IssueCard from './IssueCard';
import ScoreDashboard from './ScoreDashboard';
import { downloadPDFReport } from '../../utils/pdfExport';
import { useCodeReview } from '../../hooks/useCodeReview';
import { reviewCodeDemo } from '../../services/api';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'bugs', label: 'Bugs', icon: Bug, color: 'text-red-400', countKey: 'bugs' },
  { key: 'security', label: 'Security', icon: Shield, color: 'text-orange-400', countKey: 'security_issues' },
  { key: 'optimizations', label: 'Performance', icon: Zap, color: 'text-yellow-400', countKey: 'optimizations' },
  { key: 'improvements', label: 'Quality', icon: Sparkles, color: 'text-blue-400', countKey: 'improvements' },
];

// ── Countdown Timer ────────────────────────────────────────────────────────────
function CountdownTimer({ seconds, onDone }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) { onDone?.(); return; }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onDone]);

  const pct = ((seconds - left) / seconds) * 100;
  const circ = 138.2; // 2πr where r=22
  const color = left > 30 ? '#ef4444' : left > 10 ? '#eab308' : '#22c55e';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth="4" />
          <circle
            cx="28" cy="28" r="22" fill="none"
            stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - (pct / 100) * circ}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s', filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-white font-mono">{left}</span>
        </div>
      </div>
      <p className="text-[10px] text-gray-600">sec remaining</p>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6 py-12">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <AlertCircle className="w-10 h-10 text-purple-400/50" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-dark-800 border border-purple-500/30 flex items-center justify-center">
          <span className="text-xs">✨</span>
        </div>
      </div>
      <div>
        <p className="text-gray-400 font-medium text-sm">No review yet</p>
        <p className="text-gray-600 text-xs mt-1 leading-relaxed">
          Paste your code in the editor and click<br />"Review Code" to get AI-powered analysis
        </p>
      </div>
      <div className="flex flex-col gap-1.5 text-xs text-gray-600">
        <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500/50" /> Bug detection</div>
        <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500/50" /> Security analysis</div>
        <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500/50" /> Performance tips</div>
        <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500/50" /> Quality score</div>
      </div>
    </div>
  );
}

// ── Loading State ──────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-pink-500/30 border-b-transparent animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-purple-300 animate-glow">Gemini is analyzing...</p>
        <p className="text-xs text-gray-500 mt-1">Running deep code analysis</p>
      </div>
      <div className="space-y-2 w-full max-w-[200px]">
        {['Bug detection', 'Security scan', 'Performance check', 'Quality score'].map((t, i) => (
          <div key={t} className="shimmer h-3 rounded" style={{ animationDelay: `${i * 200}ms`, width: ['80%', '65%', '75%', '55%'][i] }} />
        ))}
      </div>
    </div>
  );
}

// ── Error State ────────────────────────────────────────────────────────────────
function ErrorState({ error, onRetry, onDemo }) {
  const [canRetry, setCanRetry] = useState(false);

  const isQuota = error && (
    error.includes('quota') || error.includes('429') ||
    error.includes('Too Many Requests') || error.includes('free tier') ||
    error.includes('RESOURCE_EXHAUSTED') || error.includes('15 requests')
  );

  if (isQuota) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-6 text-center animate-fade-in">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
          <Clock className="w-7 h-7 text-yellow-400" />
        </div>

        {/* Title */}
        <div>
          <p className="text-yellow-400 font-bold text-sm">⚡ Gemini Rate Limit Hit</p>
          <p className="text-gray-500 text-xs mt-1.5 leading-relaxed max-w-[260px]">
            Free tier allows <span className="text-yellow-300 font-medium">15 requests/min</span>.
            Wait for the timer to reset, or use Demo Mode instantly.
          </p>
        </div>

        {/* Countdown */}
        {!canRetry ? (
          <CountdownTimer seconds={60} onDone={() => setCanRetry(true)} />
        ) : (
          <div className="flex items-center gap-2 text-green-400 text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Quota likely reset! Try again.
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2 w-full max-w-[230px]">
          {/* Retry — enabled only after countdown */}
          <button
            onClick={onRetry}
            disabled={!canRetry}
            className={`btn-neon flex items-center justify-center gap-2 py-2 text-sm w-full transition-opacity ${
              !canRetry ? 'opacity-30 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            {canRetry ? 'Retry with Gemini AI' : 'Waiting for reset...'}
          </button>

          {/* Demo Mode — always available */}
          <button
            onClick={onDemo}
            className="flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold rounded-lg
              text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all w-full"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Try Demo Mode (ESLint + AST)
          </button>

          {/* Get new key */}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass flex items-center justify-center gap-2 py-1.5 text-xs w-full"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Get New API Key (Free)
          </a>
        </div>

        <p className="text-[10px] text-gray-700 max-w-[240px] leading-relaxed">
          💡 Demo Mode runs <span className="text-cyan-600">ESLint + AST analysis</span> instantly with
          zero API calls — perfect while waiting for quota reset.
        </p>
      </div>
    );
  }

  // Generic error
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-8 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <div>
        <p className="text-red-400 font-semibold text-sm">Review Failed</p>
        <p className="text-gray-600 text-xs mt-1 max-w-xs leading-relaxed">{error}</p>
      </div>
      <button onClick={onRetry} className="btn-glass flex items-center gap-2 text-xs py-1.5 px-4">
        <RefreshCw className="w-3.5 h-3.5" />
        Try Again
      </button>
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────────
export default function ReviewPanel() {
  const {
    reviewResult, isReviewing, reviewError, activeTab,
    setActiveTab, setShowDiff, setReviewResult, setIsReviewing, setReviewError,
    code, language
  } = useAppStore();
  const [isPDFExporting, setIsPDFExporting] = useState(false);
  const { runReview } = useCodeReview();

  const handleDownloadPDF = async () => {
    if (!reviewResult) return;
    setIsPDFExporting(true);
    try {
      await downloadPDFReport(reviewResult, code, language);
      toast.success('Report downloaded!', {
        style: { background: '#0f0f1a', color: '#e2e8f0', border: '1px solid #a855f7' },
      });
    } catch {
      toast.error('PDF export failed');
    } finally {
      setIsPDFExporting(false);
    }
  };

  // Demo mode handler — ESLint + AST only, zero quota
  const handleDemoMode = async () => {
    setIsReviewing(true);
    setReviewError(null);
    try {
      const res = await reviewCodeDemo(code, language);
      setReviewResult(res.data.data);
      toast('Demo mode — ESLint + AST only (no AI)', {
        icon: '🧪',
        style: { background: '#0f0f1a', color: '#e2e8f0', border: '1px solid #06b6d4' },
      });
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Demo mode failed');
    } finally {
      setIsReviewing(false);
    }
  };

  const currentItems =
    activeTab === 'bugs' ? reviewResult?.bugs || []
    : activeTab === 'security' ? reviewResult?.security_issues || []
    : activeTab === 'optimizations' ? reviewResult?.optimizations || []
    : reviewResult?.improvements || [];

  return (
    <div className="flex flex-col h-full glass rounded-xl overflow-hidden border border-purple-900/20">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-purple-900/20 bg-dark-800/50 flex items-center justify-between">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          Review Results
          {reviewResult?.demo && (
            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full font-normal">
              Demo Mode
            </span>
          )}
        </h2>
        {reviewResult && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDiff(true)}
              className="btn-glass flex items-center gap-1.5 text-xs py-1 px-2.5"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Diff View</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isPDFExporting}
              className="btn-neon flex items-center gap-1.5 text-xs py-1 px-2.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isPDFExporting ? 'Exporting...' : 'PDF'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {isReviewing ? (
          <LoadingState />
        ) : reviewError ? (
          <ErrorState error={reviewError} onRetry={runReview} onDemo={handleDemoMode} />
        ) : !reviewResult ? (
          <EmptyState />
        ) : (
          <>
            <ScoreDashboard result={reviewResult} />

            <div className="glass rounded-xl overflow-hidden border border-purple-900/20">
              {/* Tabs */}
              <div className="flex border-b border-purple-900/20 overflow-x-auto">
                {TABS.map((tab) => {
                  const count = (reviewResult[tab.countKey] || []).length;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                        activeTab === tab.key ? 'tab-active' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                      {tab.label}
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        count > 0
                          ? tab.color.replace('text-', 'bg-').replace('400', '500/20') + ' ' + tab.color
                          : 'bg-dark-700 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Issue list */}
              <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
                {currentItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 text-sm">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500/30" />
                    No {TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} issues found! 🎉
                  </div>
                ) : (
                  currentItems.map((issue, i) => (
                    <IssueCard key={i} issue={issue} index={i} />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
