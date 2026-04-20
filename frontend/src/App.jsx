import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Layout/Navbar';
import CodeEditor from './components/Editor/CodeEditor';
import ReviewPanel from './components/Review/ReviewPanel';
import CodeDiff from './components/Review/CodeDiff';
import AuthModal from './components/Auth/AuthModal';
import HistoryPanel from './components/History/HistoryPanel';
import Leaderboard from './components/Leaderboard/Leaderboard';
import useAppStore from './store/appStore';
import { useAuth } from './hooks/useAuth';

function HeroParticles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl" />
      <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-cyan-600/5 rounded-full blur-3xl" />
    </div>
  );
}

export default function App() {
  const { showDiff, showAuth, showHistory, showLeaderboard, token } = useAppStore();
  const { restoreSession } = useAuth();

  // Restore session on load
  useEffect(() => {
    if (token) restoreSession();
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 bg-grid text-gray-100">
      <HeroParticles />

      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="relative z-10 pt-14 h-screen flex flex-col">
        {/* Header banner */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-purple-900/10">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold gradient-text leading-none">
                AI Code Reviewer
              </h1>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Deep analysis · Bug detection · Security scan · Quality scoring
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Gemini 2.0 Flash
            </span>
            <span className="text-gray-700">|</span>
            <span>ESLint + AST Analysis</span>
            <span className="text-gray-700">|</span>
            <span>Real-time Review</span>
          </div>
        </div>

        {/* Editor + Review split panel */}
        <div className="flex-1 min-h-0 flex gap-0">
          {/* Code Editor — left */}
          <div className="flex-1 min-w-0 p-4 pr-2">
            <CodeEditor />
          </div>

          {/* Review Panel — right */}
          <div
            className={`transition-all duration-300 p-4 pl-2 ${
              showHistory || showLeaderboard ? 'w-[calc(50%-160px)]' : 'w-1/2'
            }`}
            style={{ minWidth: 320 }}
          >
            <ReviewPanel />
          </div>
        </div>
      </main>

      {/* Overlays */}
      {showDiff && <CodeDiff />}
      {showAuth && <AuthModal />}
      {showHistory && <HistoryPanel />}
      {showLeaderboard && <Leaderboard />}

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0f0f1a',
            color: '#e2e8f0',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '12px',
            fontSize: '13px',
          },
        }}
      />
    </div>
  );
}
