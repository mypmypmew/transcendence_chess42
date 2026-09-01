const test = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../src/db/prisma');
const chatRepository = require('../src/repositories/chatRepository');

test('conversation lookup normalizes the pair in both argument orders', async () => {
  const originalFindUnique = prisma.conversation.findUnique;
  const queries = [];

  prisma.conversation.findUnique = async (receivedQuery) => {
    queries.push(receivedQuery);
    return null;
  };

  try {
    await chatRepository.findConversationByPair(7, 3);
    await chatRepository.findConversationByPair(3, 7);

    assert.deepEqual(queries[0].where.userAId_userBId, { userAId: 3, userBId: 7 });
    assert.deepEqual(queries[1].where.userAId_userBId, queries[0].where.userAId_userBId);
  } finally {
    prisma.conversation.findUnique = originalFindUnique;
  }
});

test('conversation creation normalizes the pair', async () => {
  const originalCreate = prisma.conversation.create;
  let query;

  prisma.conversation.create = async (receivedQuery) => {
    query = receivedQuery;
    return { id: 1 };
  };

  try {
    await chatRepository.createConversation(9, 2);
    assert.deepEqual(query.data, { userAId: 2, userBId: 9 });
  } finally {
    prisma.conversation.create = originalCreate;
  }
});

test('conversation list selects only public participant fields', async () => {
  const originalFindMany = prisma.conversation.findMany;
  let query;

  prisma.conversation.findMany = async (receivedQuery) => {
    query = receivedQuery;
    return [];
  };

  try {
    await chatRepository.findConversationsByUserId(5);

    assert.deepEqual(query.where.OR, [{ userAId: 5 }, { userBId: 5 }]);
    assert.deepEqual(query.include.userA.select, { id: true, username: true, rating: true });
    assert.deepEqual(query.include.userB.select, { id: true, username: true, rating: true });
    assert.deepEqual(query.orderBy, { createdAt: 'desc' });
  } finally {
    prisma.conversation.findMany = originalFindMany;
  }
});

test('message history is ordered oldest first with public senders', async () => {
  const originalFindMany = prisma.message.findMany;
  let query;

  prisma.message.findMany = async (receivedQuery) => {
    query = receivedQuery;
    return [];
  };

  try {
    await chatRepository.findMessagesByConversationId(12);

    assert.deepEqual(query.where, { conversationId: 12 });
    assert.deepEqual(query.orderBy, { createdAt: 'asc' });
    assert.deepEqual(query.include.sender.select, { id: true, username: true, rating: true });
  } finally {
    prisma.message.findMany = originalFindMany;
  }
});