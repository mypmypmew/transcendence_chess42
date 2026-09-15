const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.UPLOADS_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'avatars-test-'));

const userRepository = require('../src/repositories/userRepository');
const avatarService = require('../src/services/avatarService');

const AVATARS_DIR = path.join(process.env.UPLOADS_DIR, 'avatars');

function fakeFile(overrides = {}) {
  return {
    mimetype: 'image/png',
    size: 70,
    buffer: Buffer.from('fake-png-bytes'),
    ...overrides,
  };
}

function fakeUser(overrides = {}) {
  return {
    id: 1,
    username: 'chessplayer',
    email: 'player@example.com',
    rating: 1200,
    avatar: null,
    passwordHash: 'stored-hash',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

test('saveAvatar writes the image into the avatars folder and stores its public path', async (t) => {
  t.mock.method(userRepository, 'findUserById', async () => fakeUser());
  const updateUser = t.mock.method(userRepository, 'updateUser', async (id, data) =>
    fakeUser({ id, ...data }));

  const user = await avatarService.saveAvatar(1, fakeFile());

  const storedPath = updateUser.mock.calls[0].arguments[1].avatar;
  assert.match(storedPath, /^\/uploads\/avatars\/1-\d+\.png$/);
  assert.equal(user.avatar, storedPath);
  assert.equal(fs.existsSync(path.join(AVATARS_DIR, path.basename(storedPath))), true);
  assert.equal('passwordHash' in user, false);
});

test('saveAvatar rejects missing, unsupported or oversized files without writing', async (t) => {
  const updateUser = t.mock.method(userRepository, 'updateUser', async () => fakeUser());
  const before = fs.readdirSync(AVATARS_DIR).length;

  const badFiles = [
    undefined,
    fakeFile({ mimetype: 'text/plain' }),
    fakeFile({ mimetype: 'image/gif' }),
    fakeFile({ size: avatarService.MAX_AVATAR_BYTES + 1 }),
  ];

  for (const file of badFiles) {
    await assert.rejects(avatarService.saveAvatar(1, file), (err) => err.status === 400);
  }

  assert.equal(updateUser.mock.callCount(), 0);
  assert.equal(fs.readdirSync(AVATARS_DIR).length, before);
});