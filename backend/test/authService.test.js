const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const userRepository = require('../src/repositories/userRepository');
const sessionService = require('../src/services/sessionService');
const authService = require('../src/services/authService');

function fakeUser(overrides = {}) {
  return {
    id: 1,
    username: 'chessplayer',
    email: 'player@example.com',
    rating: 1200,
    passwordHash: 'stored-hash',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

test('register normalizes the email before lookup and storage', async (t) => {
  t.mock.method(userRepository, 'findUserByEmail', async () => null);
  t.mock.method(userRepository, 'findUserByUsername', async () => null);
  const createUser = t.mock.method(userRepository, 'createUser', async (data) =>
    fakeUser({ email: data.email }));
  t.mock.method(sessionService, 'createSession', async () => {});

  await authService.register(
    { username: 'chessplayer', email: '  Player@Example.COM ', password: 'Password1!' },
    {},
  );

  assert.equal(createUser.mock.calls[0].arguments[0].email, 'player@example.com');
});

test('register stores a bcrypt hash that verifies against the raw password', async (t) => {
  t.mock.method(userRepository, 'findUserByEmail', async () => null);
  t.mock.method(userRepository, 'findUserByUsername', async () => null);
  const createUser = t.mock.method(userRepository, 'createUser', async () => fakeUser());
  t.mock.method(sessionService, 'createSession', async () => {});

  await authService.register(
    { username: 'chessplayer', email: 'player@example.com', password: 'Password1!' },
    {},
  );

  const { passwordHash } = createUser.mock.calls[0].arguments[0];
  assert.notEqual(passwordHash, 'Password1!');
  assert.equal(await bcrypt.compare('Password1!', passwordHash), true);
});

test('register creates a session with the new user id', async (t) => {
  t.mock.method(userRepository, 'findUserByEmail', async () => null);
  t.mock.method(userRepository, 'findUserByUsername', async () => null);
  t.mock.method(userRepository, 'createUser', async () => fakeUser({ id: 42 }));
  const createSession = t.mock.method(sessionService, 'createSession', async () => {});

  await authService.register(
    { username: 'chessplayer', email: 'player@example.com', password: 'Password1!' },
    {},
  );

  assert.equal(createSession.mock.calls[0].arguments[0], 42);
});