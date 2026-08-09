const sessionService = require('../services/sessionService');

async function requireAuth(req, res, next) {
  try {
    const session = await sessionService.getSession(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.userId = session.userId;
    req.user = session.user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireAuth;