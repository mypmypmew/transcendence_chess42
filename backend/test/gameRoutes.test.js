const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const express = require('express');

const sessionService = require('../src/services/sessionService');
const gameRoutes = require('../src/routes/gameRoutes');
const { resolve } = require('node:dns');

async function startServer(t, { userId = 1, getActiveGame }) {
	t.mock.method(sessionService, 'getSession', async () => (
		userId === null ? null : { userId }
	));

	const app = express();
	app.set('gameService', { getActiveGame });
	app.use('/api/games', gameRoutes);

	// Capture forwarded errors without exposing internal details.
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
		url: `http://127.0.0.1:${server.address().port}/api/games/active`,
		errors,
	};
}

test('active game endpoint rejects unauthenticated requests', async(t) => {
	const { url } = await startServer(t, {
		userId: null,
		getActiveGame() {
			assert.fail('Unauthenticated requests must not reach GameService');
		},
	});

	const response = await fetch(url);

	assert.equal(response.status, 401);
	assert.deepEqual(await response.json(), { error: 'Unauthorized' });
});

test('active game endpoint uses the session user id', async(t) => {
	const requestedIds = [];
	const game = {
		gameId: 42,
		whiteId: 1,
		blackId: 2,
		status: 'IN_PROGRESS',
	};

	const { url } = await startServer(t, {
		getActiveGame(playerId) {
			requestedIds.push(playerId);
			return game;
		},
	});

	const response = await fetch(`${url}?userId=999&playerId=999`);

	assert.equal(response.status, 200);
	assert.deepEqual(await response.json(), { game });
	assert.deepEqual(requestedIds, [1]);
});

test('active game endpoint returns null when no game exists', async(t) => {
	const { url } = await startServer(t, {
		getActiveGame() {
			return null;
		},
	});

	const response = await fetch(url);

	assert.equal(response.status, 200);
	assert.deepEqual(await response.json(), { game: null });
});

test('active game endpoint forwards service errors', async(t) => {
	const serviceError = new Error('Game llokup failed');
	const { url, errors } = await startServer(t, {
		getActiveGame() {
			throw serviceError;
		},
	});

	const response = await fetch(url);

	assert.equal(response.status, 500);
	assert.deepEqual(await response.json(), { error: 'Internal server error' });
	assert.equal(errors.length, 1);
	assert.strictEqual(errors[0], serviceError);
});
