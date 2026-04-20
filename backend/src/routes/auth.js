const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existing) {
      return res.status(409).json({ error: 'Email or username already taken' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const id = uuidv4();

    db.prepare('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)').run(
      id,
      username,
      email,
      hashed
    );

    const token = jwt.sign({ id, username, email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, username, email } });
  } catch (err) {
    console.error('[auth] Register error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        total_reviews: user.total_reviews,
        avg_score: user.avg_score,
      },
    });
  } catch (err) {
    console.error('[auth] Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db
      .prepare('SELECT id, username, email, total_reviews, avg_score FROM users WHERE id = ?')
      .get(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
