const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get user's review history
router.get('/', authMiddleware, (req, res) => {
  try {
    const reviews = db
      .prepare(
        'SELECT id, language, score, created_at, substr(code, 1, 200) as code_preview FROM reviews WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
      )
      .all(req.user.id);
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get a specific review
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const review = db
      .prepare('SELECT * FROM reviews WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    review.result = JSON.parse(review.result);
    res.json({ review });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Leaderboard
router.get('/leaderboard/top', (req, res) => {
  try {
    const leaders = db
      .prepare(
        'SELECT username, total_reviews, avg_score FROM users WHERE total_reviews > 0 ORDER BY avg_score DESC, total_reviews DESC LIMIT 20'
      )
      .all();
    res.json({ leaders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
