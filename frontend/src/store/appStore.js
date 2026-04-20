import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // Editor state
  code: `// Paste your code here or start typing
// AI will review it in real-time!

function findDuplicates(arr) {
  var duplicates = [];
  for (var i = 0; i <= arr.length; i++) {
    for (var j = i + 1; j < arr.length; j++) {
      if (arr[i] == arr[j]) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}

// This function has bugs, performance issues, and style problems
// Try reviewing it!`,
  language: 'javascript',
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),

  // Review state
  reviewResult: null,
  isReviewing: false,
  reviewError: null,
  activeTab: 'bugs',
  realtimeEnabled: false,  // OFF by default — saves quota

  setReviewResult: (result) => set({ reviewResult: result, reviewError: null }),
  setIsReviewing: (v) => set({ isReviewing: v }),
  setReviewError: (error) => set({ reviewError: error }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setRealtimeEnabled: (v) => set({ realtimeEnabled: v }),

  // View state
  showDiff: false,
  showHistory: false,
  showLeaderboard: false,
  showAuth: false,
  authMode: 'login', // 'login' | 'register'

  setShowDiff: (v) => set({ showDiff: v }),
  setShowHistory: (v) => set({ showHistory: v }),
  setShowLeaderboard: (v) => set({ showLeaderboard: v }),
  setShowAuth: (v) => set({ showAuth: v }),
  setAuthMode: (mode) => set({ authMode: mode }),

  // Auth state
  user: null,
  token: localStorage.getItem('token') || null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  // History
  history: [],
  setHistory: (history) => set({ history }),

  // Leaderboard
  leaderboard: [],
  setLeaderboard: (leaderboard) => set({ leaderboard }),
}));

export default useAppStore;
