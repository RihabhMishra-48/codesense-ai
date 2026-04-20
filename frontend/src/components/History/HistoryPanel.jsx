import { useEffect } from 'react';
import { X, Clock, Code2, Star } from 'lucide-react';
import useAppStore from '../../store/appStore';
import { getHistory } from '../../services/api';

export default function HistoryPanel() {
  const { history, setHistory, setShowHistory, setCode, setLanguage } = useAppStore();

  useEffect(() => {
    getHistory()
      .then((res) => setHistory(res.data.reviews))
      .catch(console.error);
  }, []);

  const loadReview = (review) => {
    setCode(review.code_preview || '');
    setLanguage(review.language);
    setShowHistory(false);
  };

  const scoreColor = (s) =>
    s >= 7 ? 'text-green-400' : s >= 4 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="fixed inset-y-0 right-0 top-14 z-40 w-80 glass border-l border-purple-900/20 flex flex-col animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-900/20">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          Review History
        </h3>
        <button onClick={() => setShowHistory(false)} className="p-1.5 glass-hover rounded-lg text-gray-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-600 text-sm">
            No review history yet.<br />
            <span className="text-xs">Start reviewing code!</span>
          </div>
        ) : (
          history.map((review) => (
            <button
              key={review.id}
              onClick={() => loadReview(review)}
              className="w-full text-left glass-hover rounded-xl p-3 border border-purple-900/10 space-y-2 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-400 uppercase bg-purple-500/10 px-2 py-0.5 rounded">
                  {review.language}
                </span>
                <span className={`text-sm font-bold ${scoreColor(review.score)} flex items-center gap-1`}>
                  <Star className="w-3 h-3" />
                  {review.score.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono truncate">{review.code_preview}</p>
              <p className="text-[10px] text-gray-600">
                {new Date(review.created_at).toLocaleString()}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
