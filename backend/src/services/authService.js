const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const sessionService = require('./sessionService');
const authValidator = require('../validators/authValidator');

const BCRYPT_ROUNDS = 12;

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    rating: user.rating,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function register({ username, email, password }, res) {
  const errors = authValidator.validateRegisterInput({ username, email, password });
  if (errors.length > 0) {
    throw httpError(400, errors.join('; '));
  }
  const normalizedEmail = authValidator.normalizeEmail(email);
  const trimmedUsername = username.trim();
  if (await userRepository.findUserByEmail(normalizedEmail)) {
    throw httpError(409, 'Email already in use');
  }
  if (await userRepository.findUserByUsername(trimmedUsername)) {
    throw httpError(409, 'Username already in use');
  }
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await userRepository.createUser({
    email: normalizedEmail,
    username: trimmedUsername,
    passwordHash,
  });

  await sessionService.createSession(user.id, res);

  return toPublicUser(user);
}

module.exports = {
  register,
  toPublicUser,
};