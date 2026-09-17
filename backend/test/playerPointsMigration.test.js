const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

test('points migration preserves existing data and defaults new users to zero', (t) => {
	const db = new DatabaseSync(':memory:');
	t.after(() => db.close());

	const directory = path.resolve(__dirname, '../prisma/migrations');
	const target = '20260917000000_default_player_points_zero';
	const migrations = readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isDirectory() && entry.name < target)
		.map((entry) => entry.name)
		.sort();

	for (const migration of migrations) {
		db.exec(readFileSync(
			path.join(directory, migration, 'migration.sql'),
			'utf8',
		));
	}

	db.exec(`
		PRAGMA foreign_keys=ON;

		INSERT INTO "User"
			(id, email, username, passwordHash, rating, avatar, updatedAt)
		VALUES
			(1, 'one@example.test', 'one', 'hash-one', 1530,
			'/uploads/avatars/one.png', CURRENT_TIMESTAMP),
			(2, 'two@example.test', 'two', 'hash-two', 1200,
			NULL, CURRENT_TIMESTAMP);

		INSERT INTO "Game" (whiteId, blackId, updatedAt)
		VALUES (1, 2, CURRENT_TIMESTAMP);

		INSERT INTO "Session" (id, userId, expiresAt)
		VALUES ('test-session', 1, '2030-01-01');

		INSERT INTO "Friendship" (userAId, userBId, requestedById)
		VALUES (1, 2, 1);
	`);

	const tables = ['User', 'Game', 'Session', 'Friendship'];
	const before = tables.map((table) =>
		db.prepare('SELECT * FROM "' + table + '" ORDER BY id').all(),
	);

	db.exec(readFileSync(
		path.join(directory, target, 'migration.sql'),
		'utf8',
	));

	for (const [index, table] of tables.entries()) {
		assert.deepEqual(
			db.prepare('SELECT * FROM "' + table + '" ORDER BY id').all(),
			before[index],
		);
	}

	assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), []);
	assert.equal(
		db.prepare('PRAGMA foreign_keys').get().foreign_keys,
		1,
	);

	db.exec(`
		INSERT INTO "User" (email, username, passwordHash, updatedAt)
		VALUES ('new@example.test', 'new', 'new-hash', CURRENT_TIMESTAMP);
	`);

	const newUser = db.prepare(
		'SELECT id, rating FROM "User" WHERE username = ?',
	).get('new');

	assert.ok(newUser.id > 2);
	assert.equal(newUser.rating, 0);
})
