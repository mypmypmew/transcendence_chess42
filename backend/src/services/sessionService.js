const crypto = require('crypto');
const sessionRepository = require('../repositories/sessionRepository');


const SESSION_COOKIE = 'sid';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

async function createSession(userId, res) {
  const id = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await sessionRepository.createSession({ id, userId, expiresAt });

  res.cookie(SESSION_COOKIE, id, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
}

async function getSession(req) {
  const id = req.cookies?.[SESSION_COOKIE];
  if (!id) return null;

  const session = await sessionRepository.findSessionById(id);
  if (!session) return null;

  if (session.expiresAt <= new Date()) {
    await sessionRepository.deleteSessionById(id);
    return null;
  }

  return session;
}

async function destroySession(req, res) {
  const id = req.cookies?.[SESSION_COOKIE];
  if (id) {
    await sessionRepository.deleteSessionById(id);
  }
  res.clearCookie(SESSION_COOKIE, { path: '/' });
}

module.exports = {
  createSession,
  getSession,
  destroySession,
  SESSION_COOKIE,
};