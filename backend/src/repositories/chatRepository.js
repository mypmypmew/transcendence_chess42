const prisma = require('../db/prisma');

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


module.exports = {
  findConversationByPair,
  createConversation,
};