const path = require('path');
const fs = require('fs');

let db = null;

// better-sqlite3 is a native module that doesn't work on Vercel serverless.
// Database features (auth, history) are disabled in serverless environment.
// Core AI review works without DB.
try {
  const Database = require('better-sqlite3');
  const isVercel = process.env.VERCEL === '1';
  const dbDir = isVercel ? '/tmp' : path.join(__dirname, '../../data');
  if (!isVercel && !fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  db = new Database(path.join(dbDir, 'codereview.db'));
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_reviews INTEGER DEFAULT 0,
      avg_score REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      language TEXT,
      code TEXT,
      result TEXT,
      score REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  console.log('[DB] SQLite initialized successfully');
} catch (err) {
  console.warn('[DB] SQLite not available (Vercel serverless mode). Auth/history disabled.', err.message);
  db = null;
}

// Null-safe proxy so routes don't crash when db is null
const safeDb = db
  ? db
  : new Proxy({}, {
      get: () => () => ({ changes: 0, lastInsertRowid: null, run: () => {}, all: () => [], get: () => null }),
    });

module.exports = safeDb;
