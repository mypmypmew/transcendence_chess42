const prisma = require('../db/prisma');

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
  createUser,
};
