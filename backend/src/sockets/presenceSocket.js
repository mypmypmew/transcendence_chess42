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
  socket.on('disconnect', () => {
    presenceService.removeConnection(userId, socket.id);
  });
}

async function broadcastPresenceChange(io, { userId, online }) {
  try {
    const friendIds = await findFriendIds(userId);

    for (const friendId of friendIds) {
      io.to(userRoom(friendId)).emit('presence:update', { userId, online });
    }
  } catch (err) {
    console.error('presence broadcast failed:', err);
  }
}

function notifyNewFriendship(io, presenceService, userAId, userBId) {
  io.to(userRoom(userAId)).emit('presence:update', {
    userId: userBId,
    online: presenceService.isOnline(userBId),
  });

  io.to(userRoom(userBId)).emit('presence:update', {
    userId: userAId,
    online: presenceService.isOnline(userAId),
  });
}

module.exports = registerPresenceHandlers;
module.exports.broadcastPresenceChange = broadcastPresenceChange;
module.exports.notifyNewFriendship = notifyNewFriendship;