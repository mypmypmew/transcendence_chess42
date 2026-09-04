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

module.exports = {
  listConversations,
};