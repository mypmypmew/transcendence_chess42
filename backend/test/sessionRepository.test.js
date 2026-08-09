const test = require('node:test');
const assert = require('node:assert/strict');

const prisma = require('../src/db/prisma');
const sessionRepository = require('../src/repositories/sessionRepository');

test('session lookup selects only public user fields', async () => {
  const originalFindUnique = prisma.session.findUnique;
  let query;

  prisma.session.findUnique = async (receivedQuery) => {
    query = receivedQuery;
    return null;
  };

  try {
    await sessionRepository.findSessionById('session-id');

    assert.deepEqual(query.where, {
      id: 'session-id',
    });

    assert.deepEqual(query.include.user.select, {
      id: true,
      email: true,
      username: true,
      rating: true,
      createdAt: true,
      updatedAt: true,
    });

    assert.equal(
      Object.hasOwn(query.include.user.select, 'passwordHash'),
      false,
    );
  } finally {
    prisma.session.findUnique = originalFindUnique;
  }
});