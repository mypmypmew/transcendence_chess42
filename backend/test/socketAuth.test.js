const test = require('node:test');
const assert = require('node:assert/strict');
const sessionService = require('../src/services/sessionService');
const socketAuth = require('../src/middlewares/socketAuth');

function fakeSocket(cookieHeader) {
  return {
    request: { headers: cookieHeader ? { cookie: cookieHeader } : {} },
    data: {},
  };
}

test('socketAuth rejects a handshake with no cookie header', async (t) => {
  const getSession = t.mock.method(sessionService, 'getSession', async () => null);
  const socket = fakeSocket(undefined);

  let passedError;
  await socketAuth(socket, (err) => { passedError = err; });

  assert.equal(passedError.message, 'Unauthorized');
  assert.deepEqual(Object.keys(getSession.mock.calls[0].arguments[0].cookies), []);
  assert.deepEqual(socket.data, {});
});

test('socketAuth rejects an unknown or expired session', async (t) => {
  t.mock.method(sessionService, 'getSession', async () => null);
  const socket = fakeSocket('sid=stale-token');

  let passedError;
  await socketAuth(socket, (err) => { passedError = err; });

  assert.equal(passedError.message, 'Unauthorized');
  assert.deepEqual(socket.data, {});
});

test('socketAuth attaches the authenticated user to socket.data', async (t) => {
  t.mock.method(sessionService, 'getSession', async () => ({
    id: 'valid-token',
    userId: 7,
    user: { id: 7, username: 'chessplayer', email: 'player@example.com', rating: 1200 },
  }));
  const socket = fakeSocket('sid=valid-token');

  let passedError = 'untouched';
  await socketAuth(socket, (err) => { passedError = err; });

  assert.equal(passedError, undefined);
  assert.equal(socket.data.userId, 7);
  assert.equal('passwordHash' in socket.data.user, false);
});

test('socketAuth parses the sid from a multi-cookie header', async (t) => {
  const getSession = t.mock.method(sessionService, 'getSession', async () => null);
  const socket = fakeSocket('theme=dark; sid=abc123; lang=en');

  await socketAuth(socket, () => {});

  assert.equal(getSession.mock.calls[0].arguments[0].cookies.sid, 'abc123');
});

test('socketAuth rejects without leaking an internal error', async (t) => {
  t.mock.method(sessionService, 'getSession', async () => {
    throw new Error('database is on fire');
  });
  const socket = fakeSocket('sid=valid-token');

  let passedError;
  await socketAuth(socket, (err) => { passedError = err; });

  assert.equal(passedError.message, 'Unauthorized');
});