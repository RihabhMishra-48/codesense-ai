# CodeSense AI — Intelligent Code Reviewer

> 🤖 AI-powered full-stack code review application using Google Gemini 2.0 Flash

![CodeSense AI](https://img.shields.io/badge/Powered%20by-Gemini%20AI-blue?style=for-the-badge&logo=google)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🧠 **AI-Powered Review** — Gemini 2.0 Flash deep code analysis
- 🐛 **Bug Detection** — Logical errors, off-by-one, null references
- 🔒 **Security Scanning** — XSS, injection, hardcoded secrets
- ⚡ **Performance Tips** — O(n²) → O(n) suggestions
- 📊 **Quality Score** — 0–10 animated dashboard
- 🎯 **Line Highlighting** — Issues marked directly in editor
- 🔄 **Code Diff View** — Original vs AI-improved side-by-side
- 📄 **PDF Report Export** — Download full analysis report
- 🧪 **Demo Mode** — ESLint + AST analysis (no API needed)
- ⚡ **Real-time Review** — Debounced live analysis while typing
- 🔐 **JWT Authentication** — Save review history
- 🏆 **Leaderboard** — Top coders ranking

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Editor | Monaco Editor (VS Code-like) |
| AI | Google Gemini 2.0 Flash |
| Backend | Node.js + Express |
| Static Analysis | ESLint + Acorn AST |
| Auth | JWT + bcryptjs |
| Database | SQLite (better-sqlite3) |

## 🚀 Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/codesense-ai.git
cd codesense-ai
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 🎉

## 🔑 Environment Variables

**backend/.env**
```
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here
PORT=3001
```

Get your free Gemini API key at: https://aistudio.google.com/apikey

## 📡 API Endpoints

```
POST /api/review-code       — AI code review
POST /api/review-code?demo  — Demo mode (ESLint + AST only)
POST /api/auth/register     — Register
POST /api/auth/login        — Login
GET  /api/history           — Review history (auth required)
GET  /api/history/leaderboard/top — Leaderboard
GET  /api/health            — Health check
```

## 🎨 Screenshots

Dark neon purple theme with glassmorphism UI, Monaco editor, animated score ring, and collapsible issue cards with "Why this matters" explanations.

---

Made with ❤️ for hackathons
