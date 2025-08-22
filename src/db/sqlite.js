const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../app.db');
const db = new sqlite3.Database(dbPath);

// Create table if not exists

const init = () => {
  db.run(`CREATE TABLE IF NOT EXISTS objects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL CHECK(category IN ('P','D','C','A')),
    name TEXT NOT NULL,
    data TEXT,
    position INTEGER NOT NULL,
    taken INTEGER NOT NULL DEFAULT 0
  )`);
  // Migration: add 'taken' column if it doesn't exist
  db.get("PRAGMA table_info(objects)", (err, info) => {
    db.all("PRAGMA table_info(objects)", (err, columns) => {
      if (!columns.some(col => col.name === 'taken')) {
        db.run("ALTER TABLE objects ADD COLUMN taken INTEGER NOT NULL DEFAULT 0");
      }
    });
  });
};

module.exports = { db, init };
