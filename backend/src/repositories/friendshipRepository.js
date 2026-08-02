const prisma = require('../db/prisma');

function normalizeUserIds(firstUserId, secondUserId) {
  if (
    !Number.isInteger(firstUserId)
    || !Number.isInteger(secondUserId)
    || firstUserId <= 0
    || secondUserId <= 0
  ) {
    throw new TypeError('User ids must be positive integers');
  }

  if (firstUserId === secondUserId) {
    throw new Error('A user cannot be friends with themselves');
  }

  return firstUserId < secondUserId
    ? { userAId: firstUserId, userBId: secondUserId }
    : { userAId: secondUserId, userBId: firstUserId };
}

async function findFriendship(firstUserId, secondUserId) {
  const { userAId, userBId } = normalizeUserIds(
    firstUserId,
    secondUserId,
  );

  return prisma.friendship.findUnique({
    where: {
      userAId_userBId: {
        userAId,
        userBId,
      },
    },
  });
}

async function createFriendship(firstUserId, secondUserId) {
  const { userAId, userBId } = normalizeUserIds(
    firstUserId,
    secondUserId,
  );

  return prisma.friendship.create({
    data: {
      userAId,
      userBId,
    },
  });
}

module.exports = {
  findFriendship,
  createFriendship,
};