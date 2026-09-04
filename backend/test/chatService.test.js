const test = require('node:test');
const assert = require('node:assert/strict');
const chatRepository = require('../src/repositories/chatRepository');
const chatService = require('../src/services/chatService');

const ALICE = { id: 3, username: 'alice', rating: 1200 };
const BOB = { id: 7, username: 'bob', rating: 1250 };

function fakeConversation(overrides = {}) {
  return {
    id: 12,
    userAId: ALICE.id,
    userBId: BOB.id,
    createdAt: new Date('2026-01-01'),
    userA: ALICE,
    userB: BOB,
    ...overrides,
  };
}

test('sendMessage takes the sender from the caller, never the payload', async (t) => {
  t.mock.method(chatRepository, 'findConversationById', async () => fakeConversation());
  const createMessage = t.mock.method(chatRepository, 'createMessage', async () => ({ id: 1 }));

  await chatService.sendMessage(BOB.id, 12, 'hello');

  assert.equal(createMessage.mock.calls[0].arguments[0].senderId, BOB.id);
});

test('sendMessage rejects empty, whitespace and over-long bodies', async (t) => {
  const createMessage = t.mock.method(chatRepository, 'createMessage', async () => ({ id: 1 }));

  const badBodies = ['', '   ', '\n\t', 'x'.repeat(2001), 42, null];

  for (const body of badBodies) {
    await assert.rejects(
      chatService.sendMessage(BOB.id, 12, body),
      (err) => err.status === 400,
    );
  }

  assert.equal(createMessage.mock.callCount(), 0);
});

test('sendMessage trims the stored body', async (t) => {
  t.mock.method(chatRepository, 'findConversationById', async () => fakeConversation());
  const createMessage = t.mock.method(chatRepository, 'createMessage', async () => ({ id: 1 }));

  await chatService.sendMessage(BOB.id, 12, '  hello  ');

  assert.equal(createMessage.mock.calls[0].arguments[0].body, 'hello');
});

test('sendMessage rejects a non-participant with 404', async (t) => {
  t.mock.method(chatRepository, 'findConversationById', async () => fakeConversation());
  const createMessage = t.mock.method(chatRepository, 'createMessage', async () => ({ id: 1 }));

  await assert.rejects(
    chatService.sendMessage(999, 12, 'hello'),
    (err) => err.status === 404,
  );

  assert.equal(createMessage.mock.callCount(), 0);
});

test('getMessages rejects a non-participant with 404', async (t) => {
  t.mock.method(chatRepository, 'findConversationById', async () => fakeConversation());
  const findMessages = t.mock.method(chatRepository, 'findMessagesByConversationId', async () => []);

  await assert.rejects(
    chatService.getMessages(999, 12),
    (err) => err.status === 404,
  );

  assert.equal(findMessages.mock.callCount(), 0);
});