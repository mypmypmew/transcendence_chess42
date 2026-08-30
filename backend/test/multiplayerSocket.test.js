const http = require('node:http');
const test = require('node:test');
const assert = require('node:assert/strict');

const { Server } = require('socket.io');
const { io: createClient } = require('socket.io-client');

const { GameService } = require('../src/services/gameService');
const { MatchmakingService } = require('../src/services/matchmakingService');
const { registerMatchmakingHandlers } = require('../src/socket/matchmakingSocket');
const { registerGameHandlers } = require('../src/socket/gameSocket');

// Wait for one Socket.IO event and reject if it never arrives.
// The timeout prevents a broken integration test from hanging forever.
function waitForEvent(socket, eventName) {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject(
				new Error(`Timed out waiting for ${eventName}`),
			);
		}, 5000);

		socket.once(eventName, (payload) => {
			clearTimeout(timeout);
			resolve(payload);
		});
	});
}

test('matches two authenticated Socket.IO clients', async (t) => {
	let nextGameId = 1;

	const fakeGameRepository = {
		// Simulate Prisma while keeping this integration test independent from a real database.
		async createGame(players) {
			return {
				id: nextGameId++,
				...players,
			};
		},

		async finishGame() {
			return undefined;
		},
	};

	const gameService = new GameService({
		gameRepository: fakeGameRepository,
	});
	
	const matchmakingService = new MatchmakingService({
		gameService,
	});

	const httpServer = http.createServer();
	const io = new Server(httpServer);

	// Simulate completed socketAuth middleware.
	// Authentication itself already has separate middleware tests.
	io.use((socket, next) => {
		socket.data.userId = socket.handshake.auth.userId;
		next();
	});

	// Register the same handlers used by the real backend server.
	io.on('connection', (socket) => {
		registerMatchmakingHandlers({
			io,
			socket,
			matchmakingService,
		});

		registerGameHandlers({
			io,
			socket,
			gameService,
		});
	});

	// Use an automatically selected free local port.
	await new Promise((resolve) => {
		httpServer.listen(0, '127.0.0.1', resolve);
	});

	const address = httpServer.address();
	const serverUrl = `http://127.0.0.1:${address.port}`;

	const whiteClient = createClient(serverUrl, {
		auth: { userId: 1 },
		transports: ['websocket'],
	});

	const blackClient = createClient(serverUrl, {
		auth: { userId: 2 },
		transports: ['websocket'],
	});

	// Always close clients and the temporary server after the test.
	t.after(async () => {
		whiteClient.disconnect();
		blackClient.disconnect();

		await new Promise((resolve) => {
			io.close(resolve);
		});
	});

	// Wait until both real network connections are ready.
	await Promise.all([
		waitForEvent(whiteClient, 'connect'),
		waitForEvent(blackClient, 'connect'),
	]);

	const waitingEvent = waitForEvent(
		whiteClient,
		'matchmaking:waiting',
	);

	whiteClient.emit('matchmaking:join');

	await waitingEvent;

	// Register both listeners before the second player triggers the match.
	const whiteMatch = waitForEvent(
		whiteClient,
		'matchmaking:matched',
	);

	const blackMatch = waitForEvent(
		blackClient,
		'matchmaking:matched',
	);

	blackClient.emit('matchmaking:join');

	const [
		whiteGame,
		blackGame,
	] = await Promise.all([
		whiteMatch,
		blackMatch,
	]);

	// Both clients must receive exactly the same authoritative game.
	assert.deepEqual(whiteGame, blackGame);
	assert.equal(whiteGame.gameId, 1);
	assert.equal(whiteGame.whiteId, 1);
	assert.equal(whiteGame.blackId, 2);
	assert.equal(whiteGame.status, 'IN_PROGRESS');

});
