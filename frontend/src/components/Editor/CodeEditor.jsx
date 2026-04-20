import { useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Play, ToggleLeft, ToggleRight, Copy, Trash2, Upload } from 'lucide-react';
import useAppStore from '../../store/appStore';
import { useCodeReview } from '../../hooks/useCodeReview';
import LanguageSelector, { MONACO_LANG_MAP } from './LanguageSelector';
import toast from 'react-hot-toast';

const AI_THEME = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6b7ca3', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'a78bfa', fontStyle: 'bold' },
    { token: 'string', foreground: '86efac' },
    { token: 'number', foreground: 'fbbf24' },
    { token: 'type', foreground: '67e8f9' },
    { token: 'function', foreground: 'c084fc' },
    { token: 'variable', foreground: 'e2e8f0' },
    { token: 'operator', foreground: 'ec4899' },
  ],
  colors: {
    'editor.background': '#0a0a0f',
    'editor.foreground': '#e2e8f0',
    'editor.lineHighlightBackground': '#141428',
    'editorLineNumber.foreground': '#374151',
    'editorLineNumber.activeForeground': '#a855f7',
    'editor.selectionBackground': '#7c3aed40',
    'editor.inactiveSelectionBackground': '#7c3aed20',
    'editorCursor.foreground': '#a855f7',
    'editorGutter.background': '#0a0a0f',
    'editorWidget.background': '#0f0f1a',
    'editorSuggestWidget.background': '#0f0f1a',
    'editorSuggestWidget.border': '#7c3aed60',
    'editorSuggestWidget.selectedBackground': '#7c3aed40',
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#a855f730',
    'scrollbarSlider.hoverBackground': '#a855f750',
  },
};

export default function CodeEditor() {
  const { code, language, setCode, setLanguage, reviewResult, realtimeEnabled, setRealtimeEnabled, isReviewing } =
    useAppStore();
  const { runReview, runReviewDebounced } = useCodeReview();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.editor.defineTheme('ai-dark', AI_THEME);
    monaco.editor.setTheme('ai-dark');
  }

  // Apply line decorations for issues
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !reviewResult) return;

    const allIssues = [
      ...(reviewResult.bugs || []),
      ...(reviewResult.security_issues || []),
      ...(reviewResult.optimizations || []),
      ...(reviewResult.improvements || []),
    ].filter((i) => i.line);

    const decorations = allIssues.map((issue) => ({
      range: new monaco.Range(issue.line, 1, issue.line, 999),
      options: {
        isWholeLine: true,
        className: issue.severity === 'critical'
          ? 'bg-red-900/20 border-l-2 border-red-500'
          : issue.severity === 'warning'
          ? 'bg-yellow-900/20 border-l-2 border-yellow-500'
          : 'bg-blue-900/20 border-l-2 border-blue-500',
        glyphMarginClassName: issue.severity === 'critical' ? 'text-red-500' : issue.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500',
        overviewRuler: {
          color: issue.severity === 'critical' ? '#ef4444' : issue.severity === 'warning' ? '#eab308' : '#3b82f6',
          position: monaco.editor.OverviewRulerLane.Right,
        },
        minimap: {
          color: issue.severity === 'critical' ? '#ef4444' : issue.severity === 'warning' ? '#eab308' : '#3b82f6',
          position: monaco.editor.MinimapPosition.Inline,
        },
      },
    }));

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, decorations);
  }, [reviewResult]);

  const handleChange = (val) => {
    setCode(val || '');
    if (realtimeEnabled) runReviewDebounced(val, language);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!', { style: { background: '#0f0f1a', color: '#e2e8f0', border: '1px solid #a855f7' } });
  };

  const handleClear = () => {
    setCode('');
    toast('Editor cleared', { icon: '🗑️', style: { background: '#0f0f1a', color: '#e2e8f0' } });
  };

  const handleLangChange = (lang) => {
    setLanguage(lang);
  };

  return (
    <div className="flex flex-col h-full glass rounded-xl overflow-hidden border border-purple-900/20">
      {/* Editor header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-purple-900/20 bg-dark-800/50">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <LanguageSelector value={language} onChange={handleLangChange} />
          <span className="text-xs text-gray-500 font-mono">
            {code.split('\n').length} lines · {code.length} chars
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Real-time toggle */}
          <button
            onClick={() => setRealtimeEnabled(!realtimeEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              realtimeEnabled ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30' : 'text-gray-500 bg-dark-700'
            }`}
            title="Toggle real-time review"
          >
            {realtimeEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span className="hidden sm:inline">Live</span>
          </button>

          <button onClick={handleCopy} className="p-1.5 glass-hover rounded-lg text-gray-500 hover:text-purple-400 transition-colors" title="Copy code">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleClear} className="p-1.5 glass-hover rounded-lg text-gray-500 hover:text-red-400 transition-colors" title="Clear">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language={MONACO_LANG_MAP[language] || 'plaintext'}
          value={code}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            minimap: { enabled: true, scale: 2 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'all',
            glyphMargin: true,
            folding: true,
            smoothScrolling: true,
            cursorBlinking: 'expand',
            cursorSmoothCaretAnimation: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            guides: { indentation: true, bracketPairs: true },
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-purple-900/20 bg-dark-800/50">
        <div className="flex items-center gap-2">
          {isReviewing && (
            <div className="flex items-center gap-2 text-xs text-purple-400">
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 dot-1" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 dot-2" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 dot-3" />
              </div>
              Gemini analyzing...
            </div>
          )}
        </div>
        <button
          onClick={() => runReview()}
          disabled={isReviewing || !code.trim()}
          className="btn-neon flex items-center gap-2 py-1.5 px-4 text-sm"
        >
          <Play className="w-3.5 h-3.5" />
          {isReviewing ? 'Reviewing...' : 'Review Code'}
        </button>
      </div>
    </div>
  );
}
