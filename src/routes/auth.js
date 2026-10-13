const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  try {
    const user = await authService.register(username, password, role);
    return res.status(201).json(user);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Username already exists' });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  try {
    const token = await authService.login(username, password);
    return res.json({ token });
  } catch {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;
