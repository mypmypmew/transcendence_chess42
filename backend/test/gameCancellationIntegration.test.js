const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

test('cancels interrupted games without changing history or ratings', async (t) => {
	const directory = await mkdtemp(path.join(tmpdir(), 'game-cancellation-'));
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
	const repository = require('../src/repositories/gameRepository');

	for (const id of [1, 2]) {
		await prisma.user.create({
			data: {
				id,
				username: `player-${id}`,
				email: `player-${id}@example.test`,
				passwordHash: 'unused-test-hash',
				rating: 1200 + id * 100,
			},
		});
	}

	const interrupted = await repository.createGame({ whiteId: 1, blackId: 2 });

	const completed = await prisma.game.create({
		data: {
			whiteId: 1,
			blackId: 2,
			status: 'COMPLETED',
			result: 'WHITE_WIN',
			winnerId: 1,
			pgn: '1. e4 1-0',
			endedAt: new Date('2026-01-01T12:00:00Z'),
		},
	});

	const cancelled = await prisma.game.create({
		data: {
			whiteId: 2,
			blackId: 1,
			status: 'CANCELLED',
			endedAt: new Date('2026-01-01T12:00:00Z'),
		},
	});

	const usersBefore = await prisma.user.findMany({ orderBy: { id: 'asc' } });

	assert.deepEqual(await repository.cancelInterruptedGames(), { count: 1 });

	const updated = await prisma.game.findUnique({ where: { id: interrupted.id } });

	assert.equal(updated.status, 'CANCELLED');
	assert.equal(updated.result, null);
	assert.equal(updated.winnerId, null);
	assert.ok(updated.endedAt instanceof Date);
	assert.equal(updated.whiteId, interrupted.whiteId);
	assert.equal(updated.blackId, interrupted.blackId);
	assert.equal(updated.pgn, interrupted.pgn);
	assert.deepEqual(updated.createdAt, interrupted.createdAt);

	assert.deepEqual(
		await prisma.game.findUnique({ where: { id: completed.id } }),
		completed,
	);
	assert.deepEqual(
		await prisma.game.findUnique({ where: { id: cancelled.id } }),
		cancelled,
	);
	assert.deepEqual(
		await prisma.user.findMany({ orderBy: { id: 'asc' } }),
		usersBefore,
	);

	// Repeating recovery must not modify already processed records.
	const gamesBeforeRetry = await prisma.game.findMany({ orderBy: { id: 'asc' } });

	assert.deepEqual(
		await repository.cancelInterruptedGames(),
		{ count: 0 },
	);
	assert.deepEqual(
		await prisma.game.findMany({ orderBy: { id: 'asc' } }),
		gamesBeforeRetry,
	);
});
