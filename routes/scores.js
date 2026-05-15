const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { name, phone, site, game, score } = req.body;
  if (!name || !site || !game || score == null) {
    return res.status(400).json({ error: '필수 항목 누락' });
  }
  const result = db.prepare(
    'INSERT INTO scores (name, phone, site, game, score) VALUES (?, ?, ?, ?, ?)'
  ).run(name, phone || '', site, game, Number(score));
  res.json({ id: result.lastInsertRowid });
});

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM scores ORDER BY created_at DESC').all();
  res.json(rows);
});

router.put('/:id', (req, res) => {
  const { name, phone, site, game, score } = req.body;
  db.prepare(
    'UPDATE scores SET name=?, phone=?, site=?, game=?, score=? WHERE id=?'
  ).run(name, phone || '', site, game, Number(score), req.params.id);
  res.json({ ok: true });
});

router.delete('/', (req, res) => {
  db.prepare('DELETE FROM scores').run();
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM scores WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
