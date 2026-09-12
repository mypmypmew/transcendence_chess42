const prisma = require('../db/prisma');

const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  rating: true,
};

async function findPublicUserById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: PUBLIC_USER_SELECT,
  });
}

async function searchPublicUsersByUsername(search, excludeUserId) {
  return prisma.user.findMany({
    where: {
      username: {
        contains: search,
      },
      id: {
        not: excludeUserId,
      },
    },
    select: PUBLIC_USER_SELECT,
    orderBy: {
      username: 'asc',
    },
    take: 10,
  });
}

// Load the top players and count completed games for both colors
async function findLeaderboardPlayers() {
  return prisma.user.findMany({
    select: {
      ...PUBLIC_USER_SELECT,
      _count: {
        select: {
          gamesAsWhite: {
            where: { status: 'COMPLETED' },
          },
          gamesAsBlack: {
            where: { status: 'COMPLETED' },
          },
        },
      },
    },
    orderBy: [
      { rating: 'desc' },
      { id: 'asc' },
    ],
    take: 10,
  });
}

async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

async function findUserByUsername(username) {
  return prisma.user.findUnique({
    where: { username },
  });
}

async function createUser({ email, username, passwordHash }) {
  return prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
    },
  });
}

module.exports = {
  findUserByEmail,
  findUserByUsername,
  findPublicUserById,
  searchPublicUsersByUsername,
  findLeaderboardPlayers,
  createUser,
};
