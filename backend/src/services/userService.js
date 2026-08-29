const userRepository = require('../repositories/userRepository');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    rating: user.rating,
  };
}

async function searchUsers(currentUserId, search) {
  if (typeof search !== 'string') {
    throw httpError(400, 'search must be a string with at least 2 characters');
  }

  const trimmedSearch = search.trim();

  if (trimmedSearch.length < 2) {
    throw httpError(400, 'search must be a string with at least 2 characters')
  }

  const users = await userRepository.searchPublicUsersByUsername(
    trimmedSearch,
    currentUserId,
  );

  return users.map(toPublicUser);
}

module.exports = {
  searchUsers,
};