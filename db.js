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

db.exec(`
  UPDATE scores SET site='의왕연구소' WHERE site='의왕';
  UPDATE scores SET site='서산공장'   WHERE site='서산';
  UPDATE scores SET site='평택공장'   WHERE site='평택';
`);

module.exports = db;
