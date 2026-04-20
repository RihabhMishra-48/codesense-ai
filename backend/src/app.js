require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const reviewRouter = require('./routes/review');
const authRouter = require('./routes/auth');
const historyRouter = require('./routes/history');

const app = express();

// Security headers
app.use(helmet());

// CORS — allow both local dev and any Vercel frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL, // Set this on Vercel after deploying frontend
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return cb(null, true);
      // Allow any vercel.app domain
      if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Rate limiters
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: { error: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const reviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'Too many review requests. Please wait a moment.' },
});

// Routes
app.use('/api/review-code', reviewLimiter, reviewRouter);
app.use('/api/auth', authRouter);
app.use('/api/history', historyRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    gemini: !!process.env.GEMINI_API_KEY,
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('[Global Error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Start server only when running locally (not on Vercel serverless)
if (process.env.NODE_ENV !== 'production' || process.env.LOCAL_DEV) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\n🚀 AI Code Reviewer Backend running on http://localhost:${PORT}`);
    console.log(`   Gemini AI: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '⚠️  Not configured (demo mode)'}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

// Vercel needs this export
module.exports = app;
