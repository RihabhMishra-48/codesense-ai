import { useEffect, useRef } from 'react';

function ScoreRing({ score }) {
  const circumference = 2 * Math.PI * 40; // r=40
  const offset = circumference - (score / 10) * circumference;

  const color =
    score >= 7 ? '#22c55e' : score >= 4 ? '#eab308' : '#ef4444';
  const label =
    score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Fair' : 'Needs Work';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 96 96">
          {/* Background track */}
          <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(168,85,247,0.1)" strokeWidth="8" />
          {/* Score arc */}
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{
              strokeDashoffset: offset,
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)',
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white leading-none">{score.toFixed(1)}</span>
          <span className="text-[10px] text-gray-400 font-mono mt-0.5">/10</span>
        </div>
      </div>
      <span className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{ color, background: `${color}20`, border: `1px solid ${color}40` }}>
        {label}
      </span>
    </div>
  );
}

function CategoryBar({ label, count, color, max }) {
  const pct = max > 0 ? Math.min(100, (count / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="font-mono" style={{ color }}>{count}</span>
      </div>
      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
    </div>
  );
}

export default function ScoreDashboard({ result }) {
  const counts = {
    bugs: result.bugs?.length || 0,
    security: result.security_issues?.length || 0,
    optimizations: result.optimizations?.length || 0,
    improvements: result.improvements?.length || 0,
  };
  const maxCount = Math.max(...Object.values(counts), 1);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="glass rounded-xl p-5 border border-purple-900/20 animate-slide-up space-y-5">
      {/* Score title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Code Quality Score</h3>
          <p className="text-xs text-gray-500 mt-0.5">{total} issues found</p>
        </div>
        <span className="text-xs text-purple-400 font-mono bg-purple-500/10 px-2 py-1 rounded">
          Gemini AI ✦
        </span>
      </div>

      {/* Ring */}
      <div className="flex justify-center">
        <ScoreRing score={result.score} />
      </div>

      {/* Category breakdown */}
      <div className="space-y-3">
        <CategoryBar label="🐛 Bugs" count={counts.bugs} color="#ef4444" max={maxCount} />
        <CategoryBar label="🔒 Security" count={counts.security} color="#f97316" max={maxCount} />
        <CategoryBar label="⚡ Performance" count={counts.optimizations} color="#eab308" max={maxCount} />
        <CategoryBar label="✨ Improvements" count={counts.improvements} color="#3b82f6" max={maxCount} />
      </div>

      {/* Summary */}
      {result.summary && (
        <div className="bg-dark-700/50 rounded-lg p-3 border border-purple-900/10">
          <p className="text-xs text-gray-400 leading-relaxed italic">"{result.summary}"</p>
        </div>
      )}
    </div>
  );
}
