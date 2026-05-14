const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('ranking.db');

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
