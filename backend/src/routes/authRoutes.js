const express = require('express');
const sessionService = require('../services/sessionService');

const router = express.Router();

router.post('/logout', async (req, res, next) => {
  try {
    await sessionService.destroySession(req, res);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;