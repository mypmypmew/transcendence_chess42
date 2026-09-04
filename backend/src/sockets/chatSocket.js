const chatRepository = require('../repositories/chatRepository');

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
}

module.exports = registerChatHandlers;