const chatRepository = require('../repositories/chatRepository');
const chatService = require('../services/chatService');

function conversationRoom(conversationId) {
  return `conversation:${conversationId}`;
}

function userRoom(userId) {
  return `user:${userId}`;
}

function reply(callback, response) {
  if (typeof callback === 'function') {
    callback(response);
  }
}

function registerChatHandlers(io, socket) {
  socket.join(userRoom(socket.data.userId));
  socket.on('chat:join', async (conversationId, callback) => {
    try {
      if (!Number.isInteger(conversationId) || conversationId <= 0) {
        return reply(callback, { error: 'Conversation not found' });
      }

      const conversation = await chatRepository.findConversationById(conversationId);

      if (!conversation) {
        return reply(callback, { error: 'Conversation not found' });
      }

      const userId = socket.data.userId;

      if (conversation.userAId !== userId && conversation.userBId !== userId) {
        return reply(callback, { error: 'Conversation not found' });
      }

      socket.join(conversationRoom(conversationId));
      reply(callback, { ok: true });
    } catch (err) {
      console.error('chat:join failed:', err);
      reply(callback, { error: 'Could not join conversation' });
    }
  });

  socket.on('chat:message', async (payload, callback) => {
    try {
      if (!payload || typeof payload !== 'object') {
        return reply(callback, { error: 'Invalid message payload' });
      }

      const { conversationId, body } = payload;

      if (!Number.isInteger(conversationId) || conversationId <= 0) {
        return reply(callback, { error: 'Conversation not found' });
      }

      const userId = socket.data.userId;
      const message = await chatService.sendMessage(userId, conversationId, body);

      io.to(conversationRoom(conversationId)).emit('chat:message', message);
      reply(callback, { ok: true, message });
    } catch (err) {
      if (err.status) {
        return reply(callback, { error: err.message });
      }
      console.error('chat:message failed:', err);
      reply(callback, { error: 'Could not send message' });
    }
  });
}

module.exports = registerChatHandlers;
module.exports.userRoom = userRoom;