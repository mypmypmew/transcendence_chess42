const test = require('node:test');
const assert = require('node:assert/strict');

const friendshipRepository = require('../src/repositories/friendshipRepository');
const registerPresenceHandlers = require('../src/sockets/presenceSocket');
const { broadcastPresenceChange, notifyNewFriendship } = require('../src/sockets/presenceSocket');

function fakeSocket(userId, socketId = 'socket-a') {
  const handlers = {};

  return {
    id: socketId,
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

function fakePresenceService(onlineIds = []) {
  return {
    added: [],
    removed: [],
    addConnection(userId, socketId) {
      this.added.push({ userId, socketId });
    },
    removeConnection(userId, socketId) {
      this.removed.push({ userId, socketId });
    },
    filterOnline(userIds) {
      return userIds.filter((id) => onlineIds.includes(id));
    },
    isOnline(userId) {
      return onlineIds.includes(userId);
    },
  };
}


function fakeIo() {
  const emitted = [];

  return {
    emitted,
    to(room) {
      return {
        emit(event, payload) {
          emitted.push({ room, event, payload });
        },
      };
    },
  };
}

function friendshipsOf(userId, friendIds) {
  return friendIds.map((friendId, index) => ({
    id: index + 1,
    userAId: Math.min(userId, friendId),
    userBId: Math.max(userId, friendId),
  }));
}

test('registering handlers records the connection and joins the personal room', () => {
  const presenceService = fakePresenceService();
  const socket = fakeSocket(7, 'socket-a');

  registerPresenceHandlers(socket, presenceService);

  assert.deepEqual(presenceService.added, [{ userId: 7, socketId: 'socket-a' }]);
  assert.deepEqual(socket.joinedRooms, ['user:7']);
});

test('presence:list returns only the online accepted friends', async (t) => {
  const findFriends = t.mock.method(
    friendshipRepository,
    'findAcceptedFriendshipsByUserId',
    async () => friendshipsOf(7, [3, 9, 12]),
  );

  const presenceService = fakePresenceService([3, 12, 50]);
  const socket = fakeSocket(7);
  registerPresenceHandlers(socket, presenceService);

  let reply;
  await socket.emitTo('presence:list', (received) => { reply = received; });

  assert.deepEqual(findFriends.mock.calls[0].arguments, [7]);
  assert.deepEqual(reply, { ok: true, online: [3, 12] });
});

test('presence:list uses the socket identity, never a client payload', async (t) => {
  const findFriends = t.mock.method(
    friendshipRepository,
    'findAcceptedFriendshipsByUserId',
    async () => [],
  );

  const socket = fakeSocket(7);
  registerPresenceHandlers(socket, fakePresenceService());

  let reply;
  await socket.emitTo('presence:list', { userId: 999 }, (received) => { reply = received; });

  assert.deepEqual(findFriends.mock.calls[0].arguments, [7]);
  assert.deepEqual(reply, { ok: true, online: [] });
});

test('presence:list survives a missing acknowledgement callback', async (t) => {
  t.mock.method(friendshipRepository, 'findAcceptedFriendshipsByUserId', async () => []);

  const socket = fakeSocket(7);
  registerPresenceHandlers(socket, fakePresenceService());

  await socket.emitTo('presence:list', undefined);
});

test('presence:list does not leak unexpected errors', async (t) => {
  t.mock.method(friendshipRepository, 'findAcceptedFriendshipsByUserId', async () => {
    throw new Error('database is down');
  });

  const socket = fakeSocket(7);
  registerPresenceHandlers(socket, fakePresenceService());

  let reply;
  await socket.emitTo('presence:list', (received) => { reply = received; });

  assert.deepEqual(reply, { error: 'Could not load presence' });
});

test('disconnect removes only this socket connection', () => {
  const presenceService = fakePresenceService();
  const socket = fakeSocket(7, 'socket-b');
  registerPresenceHandlers(socket, presenceService);

  socket.emitTo('disconnect', 'transport close');

  assert.deepEqual(presenceService.removed, [{ userId: 7, socketId: 'socket-b' }]);
});

test('broadcastPresenceChange notifies only accepted friends', async (t) => {
  t.mock.method(
    friendshipRepository,
    'findAcceptedFriendshipsByUserId',
    async () => friendshipsOf(7, [3, 9]),
  );

  const io = fakeIo();

  await broadcastPresenceChange(io, { userId: 7, online: false });

  assert.deepEqual(io.emitted, [
    { room: 'user:3', event: 'presence:update', payload: { userId: 7, online: false } },
    { room: 'user:9', event: 'presence:update', payload: { userId: 7, online: false } },
  ]);
});

test('broadcastPresenceChange survives a repository failure', async (t) => {
  t.mock.method(friendshipRepository, 'findAcceptedFriendshipsByUserId', async () => {
    throw new Error('database is down');
  });

  const io = fakeIo();

  await broadcastPresenceChange(io, { userId: 7, online: true });

  assert.deepEqual(io.emitted, []);
});

test('notifyNewFriendship sends each new friend the other side\'s status', () => {
  const io = fakeIo();
  const presenceService = fakePresenceService([3]);

  notifyNewFriendship(io, presenceService, 3, 7);

  assert.deepEqual(io.emitted, [
    { room: 'user:3', event: 'presence:update', payload: { userId: 7, online: false } },
    { room: 'user:7', event: 'presence:update', payload: { userId: 3, online: true } },
  ]);
});