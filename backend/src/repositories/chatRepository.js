const prisma = require('../db/prisma');

const PUBLIC_USER_SELECT = {
  select: {
    id: true,
    username: true,
    rating: true,
  },
};

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

async function findConversationsByUserId(userId) {
  return prisma.conversation.findMany({
    where: {
      OR: [
        { userAId: userId },
        { userBId: userId },
      ],
    },
    include: {
      userA: PUBLIC_USER_SELECT,
      userB: PUBLIC_USER_SELECT,
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = {
  findConversationByPair,
  createConversation,
  findConversationById,
  findConversationsByUserId,
};