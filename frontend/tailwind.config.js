/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          purple: '#a855f7',
          pink: '#ec4899',
          blue: '#3b82f6',
          cyan: '#06b6d4',
          green: '#22c55e',
          red: '#ef4444',
          orange: '#f97316',
          yellow: '#eab308',
        },
        dark: {
          950: '#030207',
          900: '#0a0a0f',
          800: '#0f0f1a',
          700: '#141428',
          600: '#1a1a35',
          500: '#21213f',
          400: '#2d2d5e',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(168, 85, 247, 0.4)',
        'neon-sm': '0 0 10px rgba(168, 85, 247, 0.3)',
        'neon-lg': '0 0 40px rgba(168, 85, 247, 0.5)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        typewriter: 'typewriter 3s steps(30) forwards',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(168, 85, 247, 0.8)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        glow: {
          from: { textShadow: '0 0 10px rgba(168, 85, 247, 0.5)' },
          to: { textShadow: '0 0 20px rgba(168, 85, 247, 0.9), 0 0 40px rgba(168, 85, 247, 0.5)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'neon-grid':
          'linear-gradient(rgba(168, 85, 247, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.05) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
