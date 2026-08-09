const test = require('node:test');
const assert = require('node:assert/strict');

const sessionService = require('../src/services/sessionService');
const requireAuth = require('../src/middlewares/requireAuth');

test('requireAuth returns 401 when the session is missing', async (t) => {
  t.mock.method(
    sessionService,
    'getSession',
    async () => null,
  );

  const req = {};
  const response = {
    statusCode: null,
    body: null,
  };

  const res = {
    status(statusCode) {
      response.statusCode = statusCode;
      return this;
    },

    json(body) {
      response.body = body;
      return this;
    },
  };

  let nextCalled = false;

  await requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.body, {
    error: 'Unauthorized',
  });
  assert.equal(nextCalled, false);
});

test('requireAuth attaches the authenticated user to the request', async (t) => {
  const publicUser = {
    id: 42,
    email: 'player@example.com',
    username: 'ChessPlayer',
    rating: 1200,
  };

  t.mock.method(
    sessionService,
    'getSession',
    async () => ({
      id: 'valid-session',
      userId: 42,
      expiresAt: new Date(Date.now() + 60_000),
      user: publicUser,
    }),
  );

  const req = {};
  const nextCalls = [];

  await requireAuth(req, {}, (...args) => {
    nextCalls.push(args);
  });

  assert.equal(req.userId, 42);
  assert.strictEqual(req.user, publicUser);
  assert.deepEqual(nextCalls, [[]]);
});

test('requireAuth forwards unexpected session errors', async (t) => {
  const databaseError = new Error('Database unavailable');

  t.mock.method(
    sessionService,
    'getSession',
    async () => {
      throw databaseError;
    },
  );

  let forwardedError;

  await requireAuth({}, {}, (error) => {
    forwardedError = error;
  });

  assert.strictEqual(forwardedError, databaseError);
});