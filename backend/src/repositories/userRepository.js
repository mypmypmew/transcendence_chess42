const prisma = require('../db/prisma');

async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
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
  createUser,
};