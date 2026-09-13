const express = require('express');
const { userRoom } = require('../sockets/chatSocket');
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

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const conversation = await chatService.openConversation(req.userId, req.body.userId);

    const io = req.app.get('io');
    let recipientId = conversation.userAId;

    if (conversation.userAId === req.userId) {
      recipientId = conversation.userBId;
    }

    io.to(userRoom(recipientId)).emit('chat:conversation', { id: conversation.id });

    res.status(201).json({ conversation });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
});

router.get('/:conversationId/messages', requireAuth, async (req, res, next) => {
  try {
    const conversationId = Number(req.params.conversationId);
    const messages = await chatService.getMessages(req.userId, conversationId);
    res.status(200).json({ messages });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;