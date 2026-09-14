const friendshipRepository = require('../repositories/friendshipRepository');
const { userRoom } = require('./chatSocket');

function reply(callback, response) {
  if (typeof callback === 'function') {
    callback(response);
  }
}

function registerPresenceHandlers(socket, presenceService) {
  const userId = socket.data.userId;

  socket.join(userRoom(userId));
  presenceService.addConnection(userId, socket.id);
}

module.exports = registerPresenceHandlers;