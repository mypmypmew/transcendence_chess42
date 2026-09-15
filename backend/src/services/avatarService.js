const fs = require('fs/promises');
const path = require('path');
const userRepository = require('../repositories/userRepository');
const { toPublicUser: toAccountUser } = require('./authService');

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', '..', 'uploads');
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const EXTENSION_BY_MIME = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function saveAvatar(userId, file) {
  if (!file) {
    throw httpError(400, 'avatar image file is required');
  }

  const extension = EXTENSION_BY_MIME[file.mimetype];
  if (!extension) {
    throw httpError(400, 'avatar must be a PNG, JPEG or WebP image');
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw httpError(400, 'avatar must be 2 MB or smaller');
  }

  const fileName = `${userId}-${Date.now()}.${extension}`;
  await fs.mkdir(AVATARS_DIR, { recursive: true });
  await fs.writeFile(path.join(AVATARS_DIR, fileName), file.buffer);

  const user = await userRepository.updateUser(userId, {
    avatar: `/uploads/avatars/${fileName}`,
  });

  return toAccountUser(user);
}

module.exports = {
  saveAvatar,
  UPLOADS_DIR,
  MAX_AVATAR_BYTES,
};
