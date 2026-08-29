const prisma = require('../db/prisma');

async function findConversationByPair(firstUserId, secondUserId) {
  const pair = canonicalPair(firstUserId, secondUserId);

  return prisma.conversation.findUnique({
    where: {
      userAId_userBId: pair,
    },
  });
}

module.exports = {
  findConversationByPair,
};