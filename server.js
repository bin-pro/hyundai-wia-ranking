const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'wia2026';

app.use(express.json());

function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Basic ')) {
    const [user, pass] = Buffer.from(auth.slice(6), 'base64').toString().split(':');
    if (user === 'admin' && pass === ADMIN_PASSWORD) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Admin"');
  res.status(401).send('Unauthorized');
}

app.get('/admin', adminAuth, (req, res) => {
  res.sendFile('admin.html', { root: 'public' });
});

app.use('/api/scores', require('./routes/scores'));
app.use('/api/rankings', require('./routes/rankings'));

app.use(express.static('public'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
