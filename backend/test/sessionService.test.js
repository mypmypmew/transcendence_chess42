const test = require('node:test');
const assert = require('node:assert/strict');

const sessionRepository = require('../src/repositories/sessionRepository');
const sessionService = require('../src/services/sessionService');

test('destroySession is idempotent and clears the cookie', async (t) => {
  const deleteSession = t.mock.method(
    sessionRepository,
    'deleteSessionById',
    async () => ({ count: 0 }),
  );

  const clearedCookies = [];

  const req = {
    cookies: {
      sid: 'missing-session',
    },
  };

  const res = {
    clearCookie(name, options) {
      clearedCookies.push({ name, options });
    },
  };

  await sessionService.destroySession(req, res);

  assert.equal(deleteSession.mock.callCount(), 1);
  assert.deepEqual(
    deleteSession.mock.calls[0].arguments,
    ['missing-session'],
  );

  assert.deepEqual(clearedCookies, [
    {
      name: 'sid',
      options: {
        path: '/',
      },
    },
  ]);
});

test('destroySession clears the cookie when no session is present', async (t) => {
  const deleteSession = t.mock.method(
    sessionRepository,
    'deleteSessionById',
    async () => ({ count: 0 }),
  );

  const clearedCookies = [];

  const req = {
    cookies: {},
  };

  const res = {
    clearCookie(name, options) {
      clearedCookies.push({ name, options });
    },
  };

  await sessionService.destroySession(req, res);

  assert.equal(deleteSession.mock.callCount(), 0);
  assert.deepEqual(clearedCookies, [
    {
      name: 'sid',
      options: {
        path: '/',
      },
    },
  ]);
});

test('destroySession propagates database errors', async (t) => {
  const databaseError = new Error('Database unavailable');

  t.mock.method(
    sessionRepository,
    'deleteSessionById',
    async () => {
      throw databaseError;
    },
  );

  const req = {
    cookies: {
      sid: 'session-id',
    },
  };

  const res = {
    clearCookie() {},
  };

  await assert.rejects(
    () => sessionService.destroySession(req, res),
    /Database unavailable/,
  );
});

test('createSession persists a random token and sets the session cookie', async (t) => {
  let storedSession;

  t.mock.method(
    sessionRepository,
    'createSession',
    async (session) => {
      storedSession = session;
      return session;
    },
  );

  const cookies = [];

  const res = {
    cookie(name, value, options) {
      cookies.push({ name, value, options });
    },
  };

  const beforeCreation = Date.now();

  await sessionService.createSession(42, res);

  const afterCreation = Date.now();

  assert.equal(storedSession.userId, 42);
  assert.match(storedSession.id, /^[a-f0-9]{64}$/);
  assert.ok(storedSession.expiresAt instanceof Date);

  assert.equal(cookies.length, 1);
  assert.equal(cookies[0].name, 'sid');
  assert.equal(cookies[0].value, storedSession.id);

  assert.deepEqual(cookies[0].options, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/',
  });

  const expectedTtl = cookies[0].options.maxAge;
  const expirationTime = storedSession.expiresAt.getTime();

  assert.ok(expirationTime >= beforeCreation + expectedTtl);
  assert.ok(expirationTime <= afterCreation + expectedTtl);
});

test('getSession returns null when the cookie is missing', async (t) => {
  const findSession = t.mock.method(
    sessionRepository,
    'findSessionById',
    async () => null,
  );

  const session = await sessionService.getSession({
    cookies: {},
  });

  assert.equal(session, null);
  assert.equal(findSession.mock.callCount(), 0);
});

test('getSession returns null when the session does not exist', async (t) => {
  const findSession = t.mock.method(
    sessionRepository,
    'findSessionById',
    async () => null,
  );

  const session = await sessionService.getSession({
    cookies: {
      sid: 'unknown-session',
    },
  });

  assert.equal(session, null);
  assert.deepEqual(
    findSession.mock.calls[0].arguments,
    ['unknown-session'],
  );
});

test('getSession returns a valid unexpired session', async (t) => {
  const expectedSession = {
    id: 'valid-session',
    userId: 42,
    expiresAt: new Date(Date.now() + 60_000),
    user: {
      id: 42,
      email: 'player@example.com',
      username: 'ChessPlayer',
      rating: 1200,
    },
  };

  t.mock.method(
    sessionRepository,
    'findSessionById',
    async () => expectedSession,
  );

  const deleteSession = t.mock.method(
    sessionRepository,
    'deleteSessionById',
    async () => ({ count: 0 }),
  );

  const session = await sessionService.getSession({
    cookies: {
      sid: 'valid-session',
    },
  });

  assert.strictEqual(session, expectedSession);
  assert.equal(deleteSession.mock.callCount(), 0);
});

test('getSession deletes an expired session and returns null', async (t) => {
  const expiredSession = {
    id: 'expired-session',
    userId: 42,
    expiresAt: new Date(Date.now() - 60_000),
  };

  t.mock.method(
    sessionRepository,
    'findSessionById',
    async () => expiredSession,
  );

  const deleteSession = t.mock.method(
    sessionRepository,
    'deleteSessionById',
    async () => ({ count: 1 }),
  );

  const session = await sessionService.getSession({
    cookies: {
      sid: 'expired-session',
    },
  });

  assert.equal(session, null);
  assert.deepEqual(
    deleteSession.mock.calls[0].arguments,
    ['expired-session'],
  );
});