const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Run real queries against an isolated database with the project migrations.
test('leaderboard orders players and counts only completed games', async (t) => {
	const directory = await mkdtemp(path.join(tmpdir(), 'leaderboard-test-'));
	const databaseUrl = `file:${path.join(directory, 'test.db').replaceAll('\\', '/')}`;
	const previousDatabaseUrl = process.env.DATABASE_URL;
	let prisma;

	t.after(async () => {
		try {
			if (prisma) {
				await prisma.$disconnect();
			}
		} finally {
			if (previousDatabaseUrl === undefined) {
				delete process.env.DATABASE_URL;
			} else {
				process.env.DATABASE_URL = previousDatabaseUrl;
			}
			await rm(directory, { recursive: true, force: true });
		}
	});

	process.env.DATABASE_URL = databaseUrl;

	execFileSync(
		process.execPath,
		[
			require.resolve('prisma/build/index.js'),
			'migrate',
			'deploy',
			'--schema',
			path.resolve(__dirname, '../prisma/schema.prisma'),
		],
		{
			env: { ...process.env, DATABASE_URL: databaseUrl },
			stdio: 'pipe',
		},
	);

	prisma = require('../src/db/prisma');
	const userService = require('../src/services/userService');

	// An empty database mist not produce placeholder players.
	assert.deepEqual(await userService.getLeaderboard(), []);

	// Seed twelve unrelated players, including equal ratings and zero games.
	for (let id = 1; id <= 12; id += 1) {
		await prisma.user.create({
			data: {
				id,
				username: `test-player-${id}`,
				email: `player-${id}@example.test`,
				passwordHash: 'unused-test-hash',
				rating: id === 2 ? 1800 : id === 1 ? 1600 : 1200,
			},
		});
	}

	// Count completed games for either color, including draws.
	await prisma.game.createMany({
		data: [
			{
				whiteId: 2,
				blackId: 1,
				status: 'COMPLETED',
				result: 'WHITE_WIN',
				winnerId: 2,
			},
			{
				whiteId: 1,
				blackId: 2,
				status: 'COMPLETED',
				result: 'BLACK_WIN',
				winnerId: 2,
			},
			{
				whiteId: 3,
				blackId: 2,
				status: 'COMPLETED',
				result: 'DRAW',
			},
			{
				whiteId: 2,
				blackId: 4,
				status: 'IN_PROGRESS',
			},
			{
				whiteId: 4,
				blackId: 2,
				status: 'CANCELLED',
			},
		],
	});

	const players = await userService.getLeaderboard();

	// Verify the top-ten limit and stable ordering across tied ratings.
	assert.deepEqual(
		players.map((player) => player.id),
		[2, 1, 3, 4, 5, 6, 7, 8, 9, 10]
	);

	assert.deepEqual(
		players.map((player) => player.rating),
		[1800, 1600, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200]
	);

	assert.deepEqual(
		players.map((player) => player.games),
		[3, 2, 1, 0, 0, 0, 0, 0, 0, 0]
	);

	// Return only the public fields, with real registered usernames.
	for (const player of players) {
		assert.equal(player.username, `test-player-${player.id}`);
		assert.deepEqual(
			Object.keys(player).sort(),
			['games', 'id', 'rating', 'username'],
		);
	}
});
