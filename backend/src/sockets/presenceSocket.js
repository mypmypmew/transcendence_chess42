const friendshipRepository = require('../repositories/friendshipRepository');
const { userRoom } = require('./chatSocket');

function reply(callback, response) {
  if (typeof callback === 'function') {
    callback(response);
  }
}

async function findFriendIds(userId) {
  const friendships = await friendshipRepository.findAcceptedFriendshipsByUserId(userId);

  return friendships.map((friendship) => (
    friendship.userAId === userId ? friendship.userBId : friendship.userAId
  ));
}

function registerPresenceHandlers(socket, presenceService) {
  const userId = socket.data.userId;

  socket.join(userRoom(userId));
  presenceService.addConnection(userId, socket.id);

  socket.on('presence:list', async (payload, callback) => {
    const acknowledge = typeof payload === 'function' ? payload : callback;

    try {
      const friendIds = await findFriendIds(userId);

      reply(acknowledge, { ok: true, online: presenceService.filterOnline(friendIds) });
    } catch (err) {
      console.error('presence:list failed:', err);
      reply(acknowledge, { error: 'Could not load presence' });
    }
  });
}

module.exports = registerPresenceHandlers;