const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const express = require('express');

const sessionService = require('../src/services/sessionService');
const userRepository = require('../src/repositories/userRepository');
const gameRepository = require('../src/repositories/gameRepository');
const userRoutes = require('../src/routes/userRoutes');
const { start } = require('node:repl');

async function startServer(t, {
	sessionUserId = 1,
	playerExists = true,
	games = [],
	historyError = null,
} = {}) {
	t.mock.method(sessionService, 'getSession', async () => (
		sessionUserId === null ? null : { userId: sessionUserId }
	));

	const findPlayer = t.mock.method(
		userRepository,
		'findPublicUserById',
		async (id) => playerExists ? { id } : null,
	);

	const findGames = t.mock.method(
		gameRepository,
		'findGamesByUserId',
		async () => {
			if (historyError) {
				throw historyError;
			}
			return games;
		},
	);

	const app = express();
	app.use('/api/users', userRoutes);

	const errors = [];
	app.use((err, req, res, next) => {
		errors.push(err);
		res.status(500).json({ error: 'Internal server error' });
	});

	const server = app.listen(0, '127.0.0.1');
	t.after(() => new Promise((resolve, reject) => {
		server.close((err) => err ? reject(err) : resolve());
		server.closeAllConnections();
	}));
	await once(server, 'listening');

	return {
		url: `http://127.0.0.1:${server.address().port}/api/users`,
		findPlayer,
		findGames,
		errors,
	};
}

test('player history requires authentication before repository access', async (t) => {
	const { url, findPlayer, findGames } = await startServer(t, {
		sessionUserId: null,
	});

	const response = await fetch(`${url}/84/games`);

	assert.equal(response.status, 401);
	assert.deepEqual(await response.json(), { error: 'Unauthorized' });
	assert.equal(findPlayer.mock.callCount(), 0);
	assert.equal(findGames.mock.callCount(), 0);
});

test('authenticated users can view another player public history', async (t) => {
	const storedGame = {
		id: 10,
		whiteId: 42,
		blackId: 84,
		status: 'COMPLETED',
		result: 'WHITE_WIN',
		winnerId: 42,
		createdAt: new Date('2026-01-01T12:00:00Z'),
		endedAt: new Date('2026-01-01T12:05:00Z'),
		pgn: 'private-detail-not-in-summary',
		white: {
			id: 42,
			username: 'whitePlayer',
			rating: 1200,
			email: 'white@example.test',
			passwordHash: 'secret',
		},
		black: {
			id: 84,
			username: 'blackPlayer',
			rating: 1250,
			email: 'black@example.test',
			passwordHash: 'secret',
		},
	};

	const { url, findPlayer, findGames } = await startServer(t, {
		games: [storedGame],
	});

	const response = await fetch(`${url}/84/games?userId=42`);

	assert.equal(response.status, 200);
	assert.deepEqual(findPlayer.mock.calls[0].arguments, [84]);
	assert.deepEqual(findGames.mock.calls[0].arguments, [84]);
	assert.deepEqual(await response.json(), {
		games: [{
			id: 10,
			status: 'COMPLETED',
			result: 'WHITE_WIN',
			winnerId: 42,
			createdAt: '2026-01-01T12:00:00.000Z',
			endedAt: '2026-01-01T12:05:00.000Z',
			white: {
				id: 42,
				username: 'whitePlayer',
				rating: 1200,
			},
			black: {
				id: 84,
				username: 'blackPlayer',
				rating: 1250,
			},
			outcome: 'LOSS',
		}],
	});
});

test('player history rejects invalid IDs before repository access', async (t) => {
	const { url, findPlayer, findGames } = await startServer(t);

	for (const id of ['abc', '0', '-1', '1.5', '9007199254740992']) {
		const response = await fetch(`${url}/${id}/games`);

		assert.equal(response.status, 400);
		assert.deepEqual(await response.json(), {
			error: 'playerId must be a positive integer',
		});
	}

	assert.equal(findPlayer.mock.callCount(), 0);
	assert.equal(findGames.mock.callCount(), 0);
});

test('player history returns 404 for a missing player', async (t) => {
	const { url, findGames } = await startServer(t, {
		playerExists: false,
	});

	const response = await fetch(`${url}/999/games`);

	assert.equal(response.status, 404);
	assert.deepEqual(await response.json(), {
		error: 'Player not found',
	});
	assert.equal(findGames.mock.callCount(), 0);
});

test('player history forwards lookup failures instead of returning empty history', async (t) => {
	const historyError = new Error('database unavailable');
	const { url, errors } = await startServer(t, { historyError });

	const response = await fetch(`${url}/84/games`);

	assert.equal(response.status, 500);
	assert.deepEqual(await response.json(), {
		error: 'Internal server error',
	});
	assert.equal(errors.length, 1);
	assert.strictEqual(errors[0], historyError);
});

test('player history returns an empty list for an existing player', async (t) => {
	const { url } = await startServer(t);

	const response = await fetch(`${url}/84/games`);

	assert.equal(response.status, 200);
	assert.deepEqual(await response.json(), {
		games: [],
	});
});
