const chatRepository = require('../repositories/chatRepository');

function conversationRoom(conversationId) {
  return `conversation:${conversationId}`;
}

function registerChatHandlers(io, socket) {
}

module.exports = registerChatHandlers;