const test = require('node:test');
const assert = require('node:assert/strict');

const userRepository = require('../src/repositories/userRepository');
const userService = require('../src/services/userService');

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

test('updateProfile trims the username, normalizes the email and returns account fields', async (t) => {
  t.mock.method(userRepository, 'findUserByEmail', async () => null);
  t.mock.method(userRepository, 'findUserByUsername', async () => null);
  const updateUser = t.mock.method(userRepository, 'updateUser', async (id, data) =>
    fakeUser({ id, ...data }));

  const user = await userService.updateProfile(1, {
    username: '  newname ',
    email: '  New@Example.COM ',
  });

  assert.deepEqual(updateUser.mock.calls[0].arguments, [
    1,
    { username: 'newname', email: 'new@example.com' },
  ]);
  assert.equal(user.email, 'new@example.com');
  assert.equal('passwordHash' in user, false);
});

test('updateProfile accepts the current user keeping their own username and email', async (t) => {
  t.mock.method(userRepository, 'findUserByEmail', async () => fakeUser({ id: 1 }));
  t.mock.method(userRepository, 'findUserByUsername', async () => fakeUser({ id: 1 }));
  const updateUser = t.mock.method(userRepository, 'updateUser', async () => fakeUser());

  await userService.updateProfile(1, {
    username: 'chessplayer',
    email: 'player@example.com',
  });

  assert.equal(updateUser.mock.callCount(), 1);
});

test('updateProfile rejects an email owned by another user with 409 and does not write', async (t) => {
  t.mock.method(userRepository, 'findUserByEmail', async () => fakeUser({ id: 2 }));
  t.mock.method(userRepository, 'findUserByUsername', async () => null);
  const updateUser = t.mock.method(userRepository, 'updateUser', async () => fakeUser());

  await assert.rejects(
    userService.updateProfile(1, { username: 'chessplayer', email: 'taken@example.com' }),
    (err) => err.status === 409,
  );

  assert.equal(updateUser.mock.callCount(), 0);
});

test('updateProfile rejects a username owned by another user with 409 and does not write', async (t) => {
  t.mock.method(userRepository, 'findUserByEmail', async () => null);
  t.mock.method(userRepository, 'findUserByUsername', async () => fakeUser({ id: 2 }));
  const updateUser = t.mock.method(userRepository, 'updateUser', async () => fakeUser());

  await assert.rejects(
    userService.updateProfile(1, { username: 'taken', email: 'player@example.com' }),
    (err) => err.status === 409,
  );

  assert.equal(updateUser.mock.callCount(), 0);
});

test('updateProfile rejects invalid or missing input with 400 and does not write', async (t) => {
  const updateUser = t.mock.method(userRepository, 'updateUser', async () => fakeUser());

  const badInputs = [
    { username: 'ab', email: 'player@example.com' },
    { username: 'chessplayer', email: 'not-an-email' },
    { username: { $ne: null }, email: 'player@example.com' },
    undefined,
  ];

  for (const input of badInputs) {
    await assert.rejects(userService.updateProfile(1, input), (err) => err.status === 400);
  }

  assert.equal(updateUser.mock.callCount(), 0);
});