const chatRepository = require('../repositories/chatRepository');
const chatService = require('../services/chatService');

function conversationRoom(conversationId) {
  return `conversation:${conversationId}`;
}

function registerChatHandlers(io, socket) {
    socket.on('chat:join', async (conversationId, callback) => {
        const conversation = await chatRepository.findConversationById(conversationId);
        
        if (!conversation) {
            return callback({ error: 'Conversation not found' });
        }

        const userId = socket.data.userId;

        if (conversation.userAId !== userId && conversation.userBId !== userId) {
            return callback({ error: 'Conversation not found' });
        }
        socket.join(conversationRoom(conversationId));
        callback({ ok: true });
    });
    socket.on('chat:message', async (payload, callback) => {
        try {
            const conversationId = payload.conversationId;
            const body = payload.body;
            const userId = socket.data.userId;
            const message = await chatService.sendMessage(userId, conversationId, body);
            io.to(conversationRoom(conversationId)).emit('chat:message', message);
            callback({ ok: true, message });
        } catch (err) {
            callback({ error: err.message });
        }
    });
}

module.exports = registerChatHandlers;