const prisma = require('../db/prisma');

function canonicalPair(firstUserId, secondUserId) {
  if (firstUserId < secondUserId) {
    return { userAId: firstUserId, userBId: secondUserId };
  }
  return { userAId: secondUserId, userBId: firstUserId };
}

async function findConversationByPair(firstUserId, secondUserId) {
  const pair = canonicalPair(firstUserId, secondUserId);

  return prisma.conversation.findUnique({
    where: {
      userAId_userBId: pair,
    },
  });
}

async function createConversation(firstUserId, secondUserId) {
  const pair = canonicalPair(firstUserId, secondUserId);

  return prisma.conversation.create({
    data: pair,
  });
}

async function findConversationById(conversationId) {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
  });
}

module.exports = {
  findConversationByPair,
  createConversation,
  findConversationById,
};