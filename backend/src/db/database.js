const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Vercel serverless: /tmp is writable. Local dev: ./data/
const isVercel = process.env.VERCEL === '1';
const dbDir = isVercel ? '/tmp' : path.join(__dirname, '../../data');
if (!isVercel && !fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'codereview.db'));


// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_reviews INTEGER DEFAULT 0,
    avg_score REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    language TEXT NOT NULL,
    code TEXT NOT NULL,
    result TEXT NOT NULL,
    score REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

module.exports = db;
