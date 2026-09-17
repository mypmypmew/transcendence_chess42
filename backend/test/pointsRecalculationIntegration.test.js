const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

test('recalculates stored points safely from completed games', async (t) => {
	const directory = await mkdtemp(path.join(tmpdir(), 'points-recalculation-'));
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
	const { recalculatePoints } = require('../src/services/pointsRecalculationService');

	for (const id of [1, 2, 3]) {
		await prisma.user.create({
			data: {
				id,
				username: `player-${id}`,
				email: `player-${id}@example.test`,
				passwordHash: 'unused-test-hash',
				rating: 1200,
			},
		});
	}

	const endedAt = new Date('2026-01-01T12:00:00Z');

	await prisma.game.create({
			data: {
				whiteId: 1,
				blackId: 2,
				status: 'COMPLETED',
				result: 'WHITE_WIN',
				winnerId: 1,
				pgn: '1-0',
				endedAt,
			},
		});

	await prisma.game.create({
			data: {
				whiteId: 1,
				blackId: 2,
				status: 'COMPLETED',
				result: 'DRAW',
				pgn: '1/2-1/2',
				endedAt,
			},
		});

	const activeGame = await prisma.game.create({
		data: { whiteId: 2, blackId: 3 },
	});

	const readPlayers = () => prisma.user.findMany({
		orderBy: { id: 'asc' },
	});

	const readGames = () => prisma.game.findMany({
		orderBy: { id: 'asc' },
	});

	const originalPlayers = await readPlayers();
	const originalGames = await readGames();

	// Preview is allowed during a game and must not change stored data.
	const preview = await recalculatePoints();

	assert.deepEqual(preview.map((player) => player.points), [130, 30, 0]);
	assert.deepEqual(preview.map((player) => player.completedGames), [2, 2, 0]);
	assert.deepEqual(await readPlayers(), originalPlayers);
	assert.deepEqual(await readGames(), originalGames);

	await assert.rejects(
		() => recalculatePoints({ apply: true }),
		/Cannot apply recalculation while games are in progress/,
	);
	assert.deepEqual(await readPlayers(), originalPlayers);
	assert.deepEqual(await readGames(), originalGames);

	await prisma.game.update({
		where: { id: activeGame.id },
		data: { status: 'CANCELLED', endedAt },
	});
	const historyBeforeApply = await readGames();

	// Fail the second player's update after the first update has succeeded.
	await prisma.$executeRawUnsafe(`
		CREATE TRIGGER fail_recalculation
		BEFORE UPDATE OF rating ON "User"
		WHEN OLD.id = 2
		BEGIN
			SELECT RAISE(ABORT, 'forced recalculation failure');
		END
	`);

	try {
		await assert.rejects(() => recalculatePoints({ apply: true }));
		assert.deepEqual(await readPlayers(), originalPlayers);
		assert.deepEqual(await readGames(), historyBeforeApply);
	} finally {
		await prisma.$executeRawUnsafe(`DROP TRIGGER fail_recalculation`);
	}

	const applied = await recalculatePoints({ apply: true });
	assert.deepEqual(applied, preview);

	const savedPlayers = await readPlayers();
	assert.deepEqual(savedPlayers.map((player) => player.rating), [130, 30, 0]);

	// Recalculation changes only ratings and their update timestamps.
	for (let index = 0; index < savedPlayers.length; index += 1) {
		assert.deepEqual(savedPlayers[index], {
			...originalPlayers[index],
			rating: preview[index].points,
			updatedAt: savedPlayers[index].updatedAt,
		});
	}
	assert.deepEqual(await readGames(), historyBeforeApply);

	// Applying again must not add points or update unchanged users.
	await recalculatePoints({ apply: true });
	assert.deepEqual(await readPlayers(), savedPlayers);
	assert.deepEqual(await readGames(), historyBeforeApply);

	await t.test('CLI previews, applies and rejects invalid arguments', async () => {
		await prisma.user.updateMany({
			data: { rating: 1200 },
		});
		const beforeCommand = await readPlayers();

		function runCommand(args = []) {
			const result = spawnSync(
				process.execPath,
				[
					path.resolve(__dirname, '../scripts/recalculatePoints.js'),
					...args,
				],
				{
					env: { ...process.env, DATABASE_URL: databaseUrl },
					encoding: 'utf8',
					timeout: 15000,
				},
			);

			assert.ifError(result.error);
			return result;
		}

		const previewCommand = runCommand();
		assert.equal(previewCommand.status, 0, previewCommand.stderr);
		assert.match(
			previewCommand.stdout,
			/Preview only: 3 player\(s\) would change\. No data written\./,
		);
		assert.deepEqual(await readPlayers(), beforeCommand);

		for (const args of [['--unknown'], ['--apply', '--unknown']]) {
			const invalidCommand = runCommand(args);
			assert.equal(invalidCommand.status, 1, invalidCommand.stderr);
			assert.match(invalidCommand.stderr, /Usage:/);
			assert.deepEqual(await readPlayers(), beforeCommand);
		}

		const applyCommand = runCommand(['--apply']);
		assert.equal(applyCommand.status, 0, applyCommand.stderr);
		assert.match(applyCommand.stdout, /Updated 3 player\(s\)\./);

		const afterCommand = await readPlayers();
		assert.deepEqual(
			afterCommand.map((player) => player.rating),
			[130, 30, 0],
		);
		assert.deepEqual(await readGames(), historyBeforeApply);

		const repeatedCommand = runCommand(['--apply']);
		assert.equal(repeatedCommand.status, 0, repeatedCommand.stderr);
		assert.match(repeatedCommand.stdout, /Updated 0 player\(s\)\./);
		assert.deepEqual(await readPlayers(), afterCommand);
		assert.deepEqual(await readGames(), historyBeforeApply);
	});
});
