const test = require('node:test');
const assert = require('node:assert/strict');

const prisma = require('../src/db/prisma');
const { recalculatePoints } = require('../src/services/pointsRecalculationService');

function mockTransaction(t, implementation) {
	const original = prisma.$transaction;

	prisma.$transaction = implementation;

	t.after(() => {
		prisma.$transaction = original;
	});
}

function setup(t, { activeGames = 0 } = {}) {
	const players = [
		{ id: 1, username: 'one', rating: 1200 },
		{ id: 2, username: 'two', rating: 30 },
		{ id: 3, username: 'three', rating: 900 },
	];
	const updates = [];

	mockTransaction(t, async (callback) => callback({
		game: {
			async count() {
				return activeGames;
			},
			async findMany() {
				return [{
					whiteId: 1,
					blackId: 2,
					status: 'COMPLETED',
					result: 'DRAW',
				}];
			},
		},
		user: {
			async findMany() {
				return players.map((player) => ({ ...player }));
			},
			async update({ where, data }) {
				updates.push({ id: where.id, rating: data.rating });
				const player = players.find((item) => item.id === where.id);
				player.rating = data.rating;
				return { ...player };
			},
		},
	}));

	return { players, updates };
}

test('previews recalculation without updating players', async (t) => {
	const { players, updates } = setup(t);
	const before = structuredClone(players);

	const totals = await recalculatePoints();

	assert.deepEqual(totals, [
		{
			id: 1,
			username: 'one',
			previousPoints: 1200,
			points: 30,
			completedGames: 1,
		},
		{
			id: 2,
			username: 'two',
			previousPoints: 30,
			points: 30,
			completedGames: 1,
		},
		{
			id: 3,
			username: 'three',
			previousPoints: 900,
			points: 0,
			completedGames: 0,
		},
	]);
	assert.deepEqual(updates, []);
	assert.deepEqual(players, before);
});

test('applies totals only to players whose points differ', async (t) => {
	const { players, updates } = setup(t);

	await recalculatePoints({ apply: true });

	assert.deepEqual(updates, [
		{ id: 1, rating: 30 },
		{ id: 3, rating: 0 },
	]);
	assert.deepEqual(players.map((player) => player.rating), [30, 30, 0]);

	updates.length = 0;
	await recalculatePoints({ apply: true });

	assert.deepEqual(updates, []);
});

test('rejects apply while games are in progress', async (t) => {
	const { players, updates } = setup(t, { activeGames: 1 });
	const before = structuredClone(players);

	await assert.rejects(
		() => recalculatePoints({ apply: true }),
		/Cannot apply recalculation while games are in progress/,
	);

	assert.deepEqual(updates, []);
	assert.deepEqual(players, before);
});

test('allows preview while games are in progress', async (t) => {
	const { updates } = setup(t, { activeGames: 1 });

	const totals = await recalculatePoints();

	assert.equal(totals.length, 3);
	assert.deepEqual(updates, []);
});

test('rejects invalid apply options before starting a transaction', async (t) => {
	let transactionCalls = 0;

	mockTransaction(t, async () => {
		transactionCalls += 1;
		assert.fail('Transaction must not be started');
	});

	for (const apply of ['true', 'false', 1, null]) {
		await assert.rejects(
			() => recalculatePoints({ apply }),
			{ name: 'TypeError', message: 'apply must be a boolean' },
		);
	}

	assert.equal(transactionCalls, 0);
});
