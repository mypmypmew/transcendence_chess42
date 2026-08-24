const { parse } = require('cookie');
const sessionService = require('../services/sessionService');


async function socketAuth(socket, next) {
  try {
    const header = socket.request.headers.cookie || '';
    const cookies = parse(header);

    const session = await sessionService.getSession({ cookies });

    if (!session) {
      return next(new Error('Unauthorized'));
    }

    socket.data.userId = session.userId;
    socket.data.user = session.user;

    next();
  } catch (err) {
    console.error('socket auth error:', err);
    next(new Error('Unauthorized'));
  }
}

    module.exports = socketAuth;