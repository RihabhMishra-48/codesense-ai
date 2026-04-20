import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { X } from 'lucide-react';
import useAppStore from '../../store/appStore';

export default function CodeDiff() {
  const { code, reviewResult, setShowDiff } = useAppStore();

  if (!reviewResult?.improved_code) return null;

  const diffStyles = {
    variables: {
      dark: {
        diffViewerBackground: '#0a0a0f',
        diffViewerColor: '#e2e8f0',
        addedBackground: '#1a3b2a',
        addedColor: '#86efac',
        removedBackground: '#3b1a1a',
        removedColor: '#fca5a5',
        wordAddedBackground: '#166534',
        wordRemovedBackground: '#7f1d1d',
        addedGutterBackground: '#0f2d1c',
        removedGutterBackground: '#2d0f0f',
        gutterBackground: '#0f0f1a',
        gutterBackgroundDark: '#0a0a0f',
        highlightBackground: '#1e1e3a',
        highlightGutterBackground: '#14143b',
        codeFoldGutterBackground: '#141428',
        codeFoldBackground: '#141428',
        emptyLineBackground: '#0a0a0f',
        gutterColor: '#6b7280',
        addedGutterColor: '#22c55e',
        removedGutterColor: '#ef4444',
        codeFoldContentColor: '#6b7280',
        diffViewerTitleBackground: '#0f0f1a',
        diffViewerTitleColor: '#a855f7',
        diffViewerTitleBorderColor: '#7c3aed40',
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDiff(false)} />

      {/* Modal */}
      <div className="relative w-full max-w-7xl max-h-[90vh] glass rounded-2xl border border-purple-500/30 flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/20">
          <div>
            <h2 className="text-base font-bold gradient-text">Code Comparison</h2>
            <p className="text-xs text-gray-500 mt-0.5">Original ↔ AI-Improved Version</p>
          </div>
          <button
            onClick={() => setShowDiff(false)}
            className="p-2 glass-hover rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diff viewer */}
        <div className="flex-1 overflow-auto text-xs">
          <ReactDiffViewer
            oldValue={code}
            newValue={reviewResult.improved_code}
            splitView={true}
            useDarkTheme={true}
            compareMethod={DiffMethod.LINES}
            leftTitle="Original Code"
            rightTitle="AI-Improved Code"
            styles={diffStyles}
            hideLineNumbers={false}
            showDiffOnly={false}
            extraLinesSurroundingDiff={3}
          />
        </div>
      </div>
    </div>
  );
}
