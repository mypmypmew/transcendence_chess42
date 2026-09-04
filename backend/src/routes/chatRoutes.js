const express = require('express');
const requireAuth = require('../middlewares/requireAuth');
const chatService = require('../services/chatService');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const conversations = await chatService.listConversations(req.userId);
    res.status(200).json({ conversations });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;