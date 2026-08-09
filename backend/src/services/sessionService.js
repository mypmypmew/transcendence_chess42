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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/',
  });
}

module.exports = {
  createSession,
  SESSION_COOKIE,
};