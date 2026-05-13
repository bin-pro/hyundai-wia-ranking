const Database = require('better-sqlite3');
const db = new Database('ranking.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    phone      TEXT    NOT NULL DEFAULT '',
    site       TEXT    NOT NULL,
    game       TEXT    NOT NULL,
    score      INTEGER NOT NULL,
    created_at TEXT    DEFAULT (datetime('now', 'localtime'))
  )
`);

module.exports = db;
