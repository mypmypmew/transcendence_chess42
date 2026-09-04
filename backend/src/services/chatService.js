const chatRepository = require('../repositories/chatRepository');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function toConversationSummary(conversation, currentUserId) {
  let otherUser = conversation.userB;

  if (conversation.userBId === currentUserId) {
    otherUser = conversation.userA;
  }

  return {
    id: conversation.id,
    createdAt: conversation.createdAt,
    user: otherUser,
  };
}

async function listConversations(userId) {
  const conversations = await chatRepository.findConversationsByUserId(userId);

  return conversations.map((conversation) => toConversationSummary(conversation, userId));
}

async function openConversation(userId, otherUserId) {
  if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
    throw httpError(400, 'A valid user id is required');
  }

  if (otherUserId === userId) {
    throw httpError(400, 'Cannot open a conversation with yourself');
  }

  const existing = await chatRepository.findConversationByPair(userId, otherUserId);

  if (existing) {
    return existing;
  }

  return chatRepository.createConversation(userId, otherUserId);
}

module.exports = {
  listConversations,
  openConversation,
};