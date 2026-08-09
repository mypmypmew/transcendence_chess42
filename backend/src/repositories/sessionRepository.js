const prisma = require('../db/prisma');

async function createSession({ id, userId, expiresAt }) {
  return prisma.session.create({
    data: { id, userId, expiresAt },
  });
}

async function findSessionById(id) {
  return prisma.session.findUnique({
    where: { id },
    include: { user: true },
  });
}

async function deleteSessionById(id) {
  return prisma.session.delete({
    where: { id },
  });
}

module.exports = {
  createSession,
  findSessionById,
  deleteSessionById,
};