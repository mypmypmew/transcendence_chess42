const test = require('node:test');
const assert = require('node:assert/strict');

const { getGamePoints, calculatePlayerPoints } = require('../src/services/gamePoints');

test('awards 100 points to white for a white win', () => {
	assert.deepEqual(getGamePoints('WHITE_WIN'), {
		white: 100,
		black: 0,
	});
});

test('awards 100 points to black for a black win', () => {
	assert.deepEqual(getGamePoints('BLACK_WIN'), {
		white: 0,
		black: 100,
	});
});

test('awards 30 points to each player for a draw', () => {
	assert.deepEqual(getGamePoints('DRAW'), {
		white: 30,
		black: 30,
	});
});

test('rejects invalid results and game statuses', () => {
	for ( const result of [
		undefined, null, '',
		'UNKNOWN', 'IN_PROGRESS', 'CANCELLED', 'COMPLETED'
	]) {
		assert.throws(
			() => getGamePoints(result),
			{
				name: 'TypeError',
				message: 'Invalid game result',
			}
		);
	}
});

test('recalculates totals from history without adding previous ratings', () => {
	const players = [
		{ id: 1, username: 'one', rating: 1200 },
		{ id: 2, username: 'two', rating: 1500 },
		{ id: 3, username: 'three', rating: 900 },
	];
	const games = [
		{ whiteId: 1, blackId: 2, status: 'COMPLETED', result: 'WHITE_WIN' },
		{ whiteId: 1, blackId: 2, status: 'COMPLETED', result: 'BLACK_WIN' },
		{ whiteId: 2, blackId: 1, status: 'COMPLETED', result: 'DRAW' },
		{ whiteId: 1, blackId: 3, status: 'IN_PROGRESS', result: null },
		{ whiteId: 3, blackId: 2, status: 'CANCELLED', result: null },
	];
	const playersBefore = structuredClone(players);
	const gamesBefore = structuredClone(games);

	const expected = [
		{
			id: 1,
			username: 'one',
			previousPoints: 1200,
			points: 130,
			completedGames: 3,
		},
		{
			id: 2,
			username: 'two',
			previousPoints: 1500,
			points: 130,
			completedGames: 3,
		},
		{
			id: 3,
			username: 'three',
			previousPoints: 900,
			points: 0,
			completedGames: 0,
		},
	];

	assert.deepEqual(calculatePlayerPoints(players, games), expected);
	assert.deepEqual(calculatePlayerPoints(players, [...games].reverse()), expected);
	assert.deepEqual(players, playersBefore);
	assert.deepEqual(games, gamesBefore);
});

test('returns zero points when there are no games', () => {
	assert.deepEqual(
		calculatePlayerPoints([{ id: 1, username: 'one', rating: 1200 }], []),
		[{
			id: 1,
			username: 'one',
			previousPoints: 1200,
			points: 0,
			completedGames: 0,
		}],
	);
	assert.deepEqual(calculatePlayerPoints([], []), []);
});

test('recalculation rejects missing or identical participants', () => {
	const players = [
		{ id: 1, username: 'one', rating: 0 },
		{ id: 2, username: 'two', rating: 0 },
	];

	for (const [whiteId, blackId] of [[1, 99], [99, 2], [1, 1]]) {
		assert.throws(
			() => calculatePlayerPoints(players, [{
				whiteId,
				blackId,
				status: 'COMPLETED',
				result: 'WHITE_WIN',
			}]),
			/Completed game has invalid participants/,
		);
	}
});

test('recalculation rejects invalid completed results', () => {
	const players = [
		{ id: 1, username: 'one', rating: 0 },
		{ id: 2, username: 'two', rating: 0 },
	];

	for (const result of [null, 'UNKNOWN']) {
		assert.throws(
			() => calculatePlayerPoints(players, [{
				whiteId: 1,
				blackId: 2,
				status: 'COMPLETED',
				result,
			}]),
			/Invalid game result/,
		);
	}
});
