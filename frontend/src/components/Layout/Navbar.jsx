import { Brain, Zap, History, Trophy, LogIn, LogOut, User, Activity } from 'lucide-react';
import useAppStore from '../../store/appStore';

export default function Navbar() {
  const {
    user,
    logout,
    setShowAuth,
    setAuthMode,
    setShowHistory,
    setShowLeaderboard,
    showHistory,
    showLeaderboard,
  } = useAppStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-purple-900/30">
      <div className="max-w-[1800px] mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-neon">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-900 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold gradient-text leading-none">CodeSense AI</h1>
            <p className="text-[10px] text-purple-400/70 leading-none mt-0.5">Powered by Gemini</p>
          </div>
        </div>

        {/* Center status */}
        <div className="hidden md:flex items-center gap-2 glass rounded-full px-3 py-1.5">
          <Activity className="w-3.5 h-3.5 text-green-400 animate-pulse" />
          <span className="text-xs text-gray-400 font-mono">AI Engine: Online</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowLeaderboard(!showLeaderboard); setShowHistory(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showLeaderboard ? 'tab-active' : 'btn-glass'}`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>

          {user && (
            <button
              onClick={() => { setShowHistory(!showHistory); setShowLeaderboard(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showHistory ? 'tab-active' : 'btn-glass'}`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">History</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 glass rounded-lg px-3 py-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs text-gray-300 font-medium">{user.username}</span>
                {user.avg_score > 0 && (
                  <span className="text-xs text-purple-400 font-mono">⭐ {user.avg_score.toFixed(1)}</span>
                )}
              </div>
              <button
                onClick={logout}
                className="p-2 glass-hover rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setAuthMode('login'); setShowAuth(true); }}
              className="btn-neon flex items-center gap-1.5 text-xs py-1.5 px-4"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
