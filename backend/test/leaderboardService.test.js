const test = require('node:test');
const assert = require('node:assert/strict');

const userRepository = require('../src/repositories/userRepository');
const userService = require('../src/services/userService');

// Verify completed-game totals and prevent private data from leaking.
test('leaderboard returns public fields and totals for both colors', async (t) => {
	t.mock.method(userRepository, 'findLeaderboardPlayers', async () => [
		{
			id: 2,
			username: 'experienced',
			rating: 1500,
			email: 'private@example.com',
			passwordHash: 'private-hash',
			_count: { gamesAsWhite: 3, gamesAsBlack: 5 },
		},
		{
			id: 1,
			username: 'newcomer',
			rating: 1200,
			_count: { gamesAsWhite: 0, gamesAsBlack: 0 },
		}
	]);

	const players = await userService.getLeaderboard();

	assert.deepEqual(players, [
		{ id: 2, username: 'experienced', rating: 1500, games: 8 },
		{ id: 1, username: 'newcomer', rating: 1200, games: 0 },
	]);
});

// Keep an empty leaderboard empty instead of returning placeholder players.
test('leaderboard returns an empty array when there are no players', async (t) => {
	t.mock.method(userRepository, 'findLeaderboardPlayers', async () => []);

	assert.deepEqual(await userService.getLeaderboard(), []);
});

// Allow database failures to reach the route error handler.
test('leaderboard propagates repository errors', async (t) => {
	const databaseError = new Error('Database unavailable');

	t.mock.method(userRepository, 'findLeaderboardPlayers', async () => {
		throw databaseError;
	});

	await assert.rejects(
		() => userService.getLeaderboard(),
		(error) => error === databaseError,
	);
});
