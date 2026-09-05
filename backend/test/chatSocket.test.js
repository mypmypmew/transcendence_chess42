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
  assert.deepEqual(socket.joinedRooms, []);
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
  assert.deepEqual(socket.joinedRooms, ['conversation:12']);
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