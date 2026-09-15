const userRepository = require('../repositories/userRepository');
const authValidator = require('../validators/authValidator');
const { toPublicUser: toAccountUser } = require('./authService');

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

// Return public leaderboard fields with total completed games.
async function getLeaderboard() {
  const players = await userRepository.findLeaderboardPlayers();

  return players.map((player) => ({
    ...toPublicUser(player),
    games: player._count.gamesAsWhite + player._count.gamesAsBlack,
  }));
}

async function updateProfile(userId, { username, email } = {}) {
  const errors = authValidator.validateProfileUpdateInput({ username, email });
  if (errors.length > 0) {
    throw httpError(400, errors.join('; '));
  }

  const trimmedUsername = username.trim();
  const normalizedEmail = authValidator.normalizeEmail(email);

  const emailOwner = await userRepository.findUserByEmail(normalizedEmail);
  if (emailOwner && emailOwner.id !== userId) {
    throw httpError(409, 'Email already in use');
  }

  const usernameOwner = await userRepository.findUserByUsername(trimmedUsername);
  if (usernameOwner && usernameOwner.id !== userId) {
    throw httpError(409, 'Username already in use');
  }

  const user = await userRepository.updateUser(userId, {
    username: trimmedUsername,
    email: normalizedEmail,
  });

  return toAccountUser(user);
}

module.exports = {
  searchUsers,
  getLeaderboard,
  updateProfile,
};
