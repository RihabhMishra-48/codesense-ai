import { Bug, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const SEVERITY_CONFIG = {
  critical: {
    icon: Bug,
    badge: 'badge-critical',
    dot: 'bg-red-500',
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
    label: 'Critical',
  },
  warning: {
    icon: AlertTriangle,
    badge: 'badge-warning',
    dot: 'bg-yellow-500',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
    label: 'Warning',
  },
  info: {
    icon: Info,
    badge: 'badge-info',
    dot: 'bg-blue-500',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    label: 'Info',
  },
};

export default function IssueCard({ issue, index }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <div
      className={`glass-hover rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden transition-all duration-300 animate-slide-up`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className={`w-1.5 h-8 rounded-full ${cfg.dot} flex-shrink-0`} />
        <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.dot.replace('bg-', 'text-')}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {cfg.label}
            </span>
            {issue.line && (
              <span className="text-[10px] text-gray-500 font-mono bg-dark-700 px-2 py-0.5 rounded">
                Line {issue.line}
              </span>
            )}
            {issue.source && (
              <span className="text-[10px] text-purple-400/60 bg-purple-500/10 px-2 py-0.5 rounded">
                {issue.source.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-300 leading-snug truncate">{issue.description}</p>
        </div>
        <div className={`text-gray-500 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-purple-900/10 pt-3 animate-fade-in">
          {issue.why && (
            <div>
              <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider mb-1">
                💡 Why this matters
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">{issue.why}</p>
            </div>
          )}
          {issue.fix && (
            <div>
              <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider mb-1.5">
                ✅ Suggested Fix
              </p>
              <pre className="text-xs text-green-300 bg-dark-800 rounded-lg p-3 overflow-x-auto font-mono leading-relaxed border border-green-900/20">
                {issue.fix}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
