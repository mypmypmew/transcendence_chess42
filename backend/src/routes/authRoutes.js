const express = require('express');
const sessionService = require('../services/sessionService');
const authService = require('../services/authService');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const user = await authService.register(req.body, res);
    res.status(201).json({ user });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    await sessionService.destroySession(req, res);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;