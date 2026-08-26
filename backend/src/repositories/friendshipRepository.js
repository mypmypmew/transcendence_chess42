const { FriendshipStatus } = require('@prisma/client');

const prisma = require('../db/prisma');

function validateFriendshipId(friendshipId) {
  if (!Number.isInteger(friendshipId) || friendshipId <= 0) {
    throw new TypeError('Friendship id must be a positive integer');
  }
}

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

async function findFriendshipById(friendshipId) {
  validateFriendshipId(friendshipId);

  return prisma.friendship.findUnique({
    where: { id: friendshipId },
  });
}

async function acceptFriendRequest(friendshipId) {
  validateFriendshipId(friendshipId);

  return prisma.friendship.update({
    where: {
      id: friendshipId,
      status: FriendshipStatus.PENDING,
    },
    data: {
      status: FriendshipStatus.ACCEPTED,
    },
  });
}

async function deleteFriendshipById(friendshipId) {
  validateFriendshipId(friendshipId);

  return prisma.friendship.delete({
    where: {
      id: friendshipId,
    },
  });
}

async function createFriendRequest(requesterId, recipientId) {
  const { userAId, userBId } = normalizeUserIds(
    requesterId,
    recipientId,
  );

  return prisma.friendship.create({
    data: {
      userAId,
      userBId,
      requestedById: requesterId,
      status: FriendshipStatus.PENDING,
    },
  });
}

module.exports = {
  findFriendship,
  findFriendshipById,
  createFriendRequest,
  acceptFriendRequest,
  deleteFriendshipById,
};
