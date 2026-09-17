const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

test('persists game points once for wins and draws', async (t) => {
	const directory = await mkdtemp(path.join(tmpdir(), 'game-points-'));
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
				rating: 0,
			},
		});
	}

	async function readPoints() {
		const players = await prisma.user.findMany({
			orderBy: { id: 'asc' },
			select: { rating: true },
		});
		return players.map((player) => player.rating);
	};

	const cases = [
		{
			result: 'WHITE_WIN',
			winnerId: 1,
			pgn: '1-0',
			expectedPoints: [100, 0],
		},
		{
			result: 'BLACK_WIN',
			winnerId: 2,
			pgn: '0-1',
			expectedPoints: [100, 100],
		},
		{
			result: 'DRAW',
			winnerId: null,
			pgn: '1/2-1/2',
			expectedPoints: [130, 130],
		},
	];

	for (const scenario of cases) {
		const before = await readPoints();
		const game = await repository.createGame({
			whiteId: 1,
			blackId: 2,
		});

		// Creating an unfinished game must not award points.
		assert.deepEqual(await readPoints(), before);

		const completion = {
			result: scenario.result,
			pgn: scenario.pgn,
		};
		const finished = await repository.finishGame(game.id, completion);

		assert.equal(finished.status, 'COMPLETED');
		assert.equal(finished.result, scenario.result);
		assert.equal(finished.winnerId, scenario.winnerId);
		assert.equal(finished.pgn, scenario.pgn);
		assert.ok(finished.endedAt instanceof Date);
		assert.deepEqual(await readPoints(), scenario.expectedPoints);
		assert.deepEqual(await repository.findGameById(game.id).then(
				({ white, black, ...record }) => record,
			),
			finished,
		);

		// A retry must preserve both the record and the points.
		const retried = await repository.finishGame(game.id, completion);

		assert.deepEqual(retried, finished);
		assert.deepEqual(await readPoints(), scenario.expectedPoints);

		await assert.rejects(
			() => repository.finishGame(game.id, {
				result: scenario.result === 'DRAW' ? 'WHITE_WIN' : 'DRAW',
			}),
			/Game already completed with a different result/,
		);

		assert.deepEqual(await readPoints(), scenario.expectedPoints);
	}
});
