const test = require('node:test');
const assert = require('node:assert/strict');
const chatRepository = require('../src/repositories/chatRepository');
const chatService = require('../src/services/chatService');
const registerChatHandlers = require('../src/sockets/chatSocket');

function fakeSocket(userId) {
  const handlers = {};

  return {
    data: { userId },
    joinedRooms: [],
    on(event, handler) {
      handlers[event] = handler;
    },
    join(room) {
      this.joinedRooms.push(room);
    },
    emitTo(event, ...args) {
      return handlers[event](...args);
    },
  };
}

test('chat:join refuses a non-participant', async (t) => {
  t.mock.method(chatRepository, 'findConversationById', async () => ({
    id: 12,
    userAId: 3,
    userBId: 7,
  }));

  const socket = fakeSocket(999);
  registerChatHandlers({}, socket);

  let reply;
  await socket.emitTo('chat:join', 12, (received) => { reply = received; });

  assert.equal(reply.error, 'Conversation not found');
  assert.deepEqual(socket.joinedRooms, ['user:999']);
});

test('chat:join adds a participant to the conversation room', async (t) => {
  t.mock.method(chatRepository, 'findConversationById', async () => ({
    id: 12,
    userAId: 3,
    userBId: 7,
  }));

  const socket = fakeSocket(7);
  registerChatHandlers({}, socket);

  let reply;
  await socket.emitTo('chat:join', 12, (received) => { reply = received; });

  assert.equal(reply.ok, true);
  assert.deepEqual(socket.joinedRooms, ['user:7', 'conversation:12']);
});

test('chat:message persists then broadcasts to the conversation room', async (t) => {
  const persisted = { id: 5, conversationId: 12, senderId: 7, body: 'hello' };
  const sendMessage = t.mock.method(chatService, 'sendMessage', async () => persisted);

  const emitted = [];
  const io = {
    to(room) {
      return {
        emit(event, payload) {
          emitted.push({ room, event, payload });
        },
      };
    },
  };

  const socket = fakeSocket(7);
  registerChatHandlers(io, socket);

  let reply;
  await socket.emitTo('chat:message', { conversationId: 12, body: 'hello' }, (received) => {
    reply = received;
  });

  assert.deepEqual(sendMessage.mock.calls[0].arguments, [7, 12, 'hello']);
  assert.deepEqual(emitted, [{ room: 'conversation:12', event: 'chat:message', payload: persisted }]);
  assert.equal(reply.ok, true);
});

test('chat:join survives a missing acknowledgement callback', async (t) => {
  t.mock.method(chatRepository, 'findConversationById', async () => ({
    id: 12,
    userAId: 3,
    userBId: 7,
  }));

  const socket = fakeSocket(7);
  registerChatHandlers({}, socket);

  await socket.emitTo('chat:join', 12, undefined);

  assert.deepEqual(socket.joinedRooms, ['user:7', 'conversation:12']);
});

test('chat:message rejects a malformed payload', async (t) => {
  const sendMessage = t.mock.method(chatService, 'sendMessage', async () => ({ id: 1 }));

  const socket = fakeSocket(7);
  registerChatHandlers({}, socket);

  for (const payload of [null, undefined, 'hello', { body: 'hi' }]) {
    let reply;
    await socket.emitTo('chat:message', payload, (received) => { reply = received; });
    assert.equal(typeof reply.error, 'string');
  }

  assert.equal(sendMessage.mock.callCount(), 0);
});

test('chat:message does not leak unexpected errors', async (t) => {
  t.mock.method(chatService, 'sendMessage', async () => {
    throw new Error('Invalid `prisma.message.create()` invocation');
  });

  const socket = fakeSocket(7);
  registerChatHandlers({}, socket);

  let reply;
  await socket.emitTo('chat:message', { conversationId: 12, body: 'hi' }, (received) => {
    reply = received;
  });

  assert.equal(reply.error, 'Could not send message');
});

test('registering handlers joins the personal user room', async (t) => {
  const socket = fakeSocket(7);
  registerChatHandlers({}, socket);

  assert.deepEqual(socket.joinedRooms, ['user:7']);
});

test('chat:join reports a failure to the caller', async (t) => {
  t.mock.method(chatRepository, 'findConversationById', async () => {
    throw new Error('database is down');
  });

  const socket = fakeSocket(7);
  registerChatHandlers({}, socket);

  let reply;
  await socket.emitTo('chat:join', 12, (received) => { reply = received; });

  assert.equal(reply.error, 'Could not join conversation');
  assert.deepEqual(socket.joinedRooms, ['user:7']);
});