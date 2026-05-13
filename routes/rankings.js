const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const games = ['typing', 'control', 'jump'];
  const result = {};
  for (const game of games) {
    result[game] = db.prepare(
      'SELECT id, name, site, score FROM scores WHERE game=? ORDER BY score DESC LIMIT 10'
    ).all(game);
  }
  res.json(result);
});

module.exports = router;
