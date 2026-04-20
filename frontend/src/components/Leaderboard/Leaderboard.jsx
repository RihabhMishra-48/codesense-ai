import { useEffect } from 'react';
import { X, Trophy, Crown, Star, Code2 } from 'lucide-react';
import useAppStore from '../../store/appStore';
import { getLeaderboard } from '../../services/api';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { leaderboard, setLeaderboard, setShowLeaderboard } = useAppStore();

  useEffect(() => {
    getLeaderboard()
      .then((res) => setLeaderboard(res.data.leaders))
      .catch(console.error);
  }, []);

  return (
    <div className="fixed inset-y-0 right-0 top-14 z-40 w-80 glass border-l border-purple-900/20 flex flex-col animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-900/20">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          Top Coders
        </h3>
        <button onClick={() => setShowLeaderboard(false)} className="p-1.5 glass-hover rounded-lg text-gray-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12 text-gray-600 text-sm">
            No data yet — be the first!<br />
            <span className="text-xs">Sign in and start reviewing code.</span>
          </div>
        ) : (
          leaderboard.map((entry, i) => (
            <div
              key={entry.username}
              className={`glass-hover rounded-xl p-3 border flex items-center gap-3 transition-all ${
                i === 0
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : i === 1
                  ? 'border-gray-400/20 bg-gray-500/5'
                  : i === 2
                  ? 'border-amber-700/20 bg-amber-700/5'
                  : 'border-purple-900/10'
              }`}
            >
              <span className="text-lg w-7 text-center flex-shrink-0">
                {MEDAL[i] || `#${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-200 truncate">{entry.username}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Code2 className="w-3 h-3" />
                  {entry.total_reviews} reviews
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-base font-bold ${i === 0 ? 'text-yellow-400' : 'text-purple-400'}`}>
                  {entry.avg_score.toFixed(1)}
                </p>
                <p className="text-[10px] text-gray-600">avg score</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
