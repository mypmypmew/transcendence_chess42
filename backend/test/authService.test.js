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

  const user = await authService.register(
    { username: 'chessplayer', email: 'player@example.com', password: 'Password1!' },
    {},
  );

  assert.equal(createSession.mock.calls[0].arguments[0], 42);
  assert.equal('passwordHash' in user, false);
});

test('register rejects a duplicate email with 409', async (t) => {
  t.mock.method(userRepository, 'findUserByEmail', async () => fakeUser());
  const createSession = t.mock.method(sessionService, 'createSession', async () => {});

  await assert.rejects(
    authService.register(
      { username: 'someoneelse', email: 'player@example.com', password: 'Password1!' },
      {},
    ),
    (err) => err.status === 409,
  );

  assert.equal(createSession.mock.callCount(), 0);
});

test('register rejects a duplicate username with 409', async (t) => {
  t.mock.method(userRepository, 'findUserByEmail', async () => null);
  t.mock.method(userRepository, 'findUserByUsername', async () => fakeUser());
  const createSession = t.mock.method(sessionService, 'createSession', async () => {});

  await assert.rejects(
    authService.register(
      { username: 'chessplayer', email: 'fresh@example.com', password: 'Password1!' },
      {},
    ),
    (err) => err.status === 409,
  );

  assert.equal(createSession.mock.callCount(), 0);
});

test('register rejects invalid input with 400', async (t) => {
  const createSession = t.mock.method(sessionService, 'createSession', async () => {});

  const badInputs = [
    { username: 'ab', email: 'player@example.com', password: 'Password1!' },
    { username: 'chessplayer', email: 'not-an-email', password: 'Password1!' },
    { username: 'chessplayer', email: 'player@example.com', password: 'password1!' },
    { username: 'chessplayer', email: 'player@example.com', password: 'Password!' },
    { username: 'chessplayer', email: 'player@example.com', password: 'Password1' },
    { username: 'chessplayer', email: 'player@example.com', password: 'short' },
    { username: { $ne: null }, email: 'player@example.com', password: 'Password1!' },
  ];

  for (const input of badInputs) {
    await assert.rejects(authService.register(input, {}), (err) => err.status === 400);
  }

  assert.equal(createSession.mock.callCount(), 0);
});

const VALID_PASSWORD = 'Password1!';
const VALID_HASH = bcrypt.hashSync(VALID_PASSWORD, 4);

test('login returns public user data and creates a session', async (t) => {
  t.mock.method(userRepository, 'findUserByEmail', async () =>
    fakeUser({ id: 7, passwordHash: VALID_HASH }));
  const createSession = t.mock.method(sessionService, 'createSession', async () => {});

  const user = await authService.login(
    { email: 'player@example.com', password: VALID_PASSWORD },
    {},
  );

  assert.equal(createSession.mock.calls[0].arguments[0], 7);
  assert.deepEqual(Object.keys(user).sort(), [
    'createdAt', 'email', 'id', 'rating', 'updatedAt', 'username',
  ]);
  assert.equal('passwordHash' in user, false);
});

test('login rejects an unknown email and a wrong password identically', async (t) => {
  t.mock.method(userRepository, 'findUserByEmail', async () => null);
  const createSession = t.mock.method(sessionService, 'createSession', async () => {});

  let unknownEmailError;
  await authService
    .login({ email: 'nobody@example.com', password: VALID_PASSWORD }, {})
    .catch((err) => { unknownEmailError = err; });

  t.mock.restoreAll();
  t.mock.method(userRepository, 'findUserByEmail', async () =>
    fakeUser({ passwordHash: VALID_HASH }));
  t.mock.method(sessionService, 'createSession', async () => {});

  let wrongPasswordError;
  await authService
    .login({ email: 'player@example.com', password: 'wrongpassword' }, {})
    .catch((err) => { wrongPasswordError = err; });

  assert.equal(unknownEmailError.status, 401);
  assert.equal(wrongPasswordError.status, 401);
  assert.equal(unknownEmailError.message, wrongPasswordError.message);
  assert.equal(createSession.mock.callCount(), 0);
});