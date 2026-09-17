const test = require('node:test');
const assert = require('node:assert/strict');

const { getGamePoints } = require('../src/services/gamePoints');

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
