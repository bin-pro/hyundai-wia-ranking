const express = require('express');
const router = express.Router();
const db = require('../db');

const ORDER = { typing: 'DESC', jump: 'DESC', control: 'ASC' };

router.get('/', (req, res) => {
  const result = {};
  for (const game of Object.keys(ORDER)) {
    result[game] = db.prepare(
      `SELECT id, name, site, score FROM scores WHERE game=? ORDER BY score ${ORDER[game]} LIMIT 10`
    ).all(game);
  }
  res.json(result);
});

module.exports = router;
