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
  UPDATE scores SET site='의왕 연구소' WHERE site IN ('의왕','의왕연구소');
  UPDATE scores SET site='서산 공장'   WHERE site IN ('서산','서산공장');
  UPDATE scores SET site='평택 공장'   WHERE site IN ('평택','평택공장');
  UPDATE scores SET site='창원 1공장'  WHERE site='창원1공장';
  UPDATE scores SET site='창원 2공장'  WHERE site='창원2공장';
  UPDATE scores SET site='창원 3공장'  WHERE site='창원3공장';
`);

module.exports = db;
