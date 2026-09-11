const chatRepository = require('../repositories/chatRepository');
const userRepository = require('../repositories/userRepository');

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

  const recipient = await userRepository.findPublicUserById(otherUserId);

  if (!recipient) {
    throw httpError(404, 'User not found');
  }

  const existing = await chatRepository.findConversationByPair(userId, otherUserId);

  if (existing) {
    return existing;
  }

  try {
    return await chatRepository.createConversation(userId, otherUserId);
  } catch (error) {
    if (error.code === 'P2002') {
      return chatRepository.findConversationByPair(userId, otherUserId);
    }
    throw error;
  }
}

async function getMessages(userId, conversationId) {
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    throw httpError(404, 'Conversation not found');
  }

  const conversation = await chatRepository.findConversationById(conversationId);

  if (!conversation) {
    throw httpError(404, 'Conversation not found');
  }

  if (conversation.userAId !== userId && conversation.userBId !== userId) {
    throw httpError(404, 'Conversation not found');
  }

  return chatRepository.findMessagesByConversationId(conversationId);
}

const MAX_MESSAGE_LENGTH = 2000;

async function sendMessage(userId, conversationId, body) {
  if (typeof body !== 'string') {
    throw httpError(400, 'Message body must be a string');
  }

  const trimmed = body.trim();

  if (trimmed.length === 0) {
    throw httpError(400, 'Message cannot be empty');
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw httpError(400, 'Message is too long');
  }

  const conversation = await chatRepository.findConversationById(conversationId);

  if (!conversation) {
    throw httpError(404, 'Conversation not found');
  }

  if (conversation.userAId !== userId && conversation.userBId !== userId) {
    throw httpError(404, 'Conversation not found');
  }

  return chatRepository.createMessage({
    conversationId,
    senderId: userId,
    body: trimmed,
  });
}

module.exports = {
  listConversations,
  openConversation,
  getMessages,
  sendMessage,
};