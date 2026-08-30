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

test('matches two clients and synchronizes a legal move', async (t) => {
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

	// Store a replacement client created during the reconnect scenario.
	let reconnectedBlackClient = null;

	// Store a third authenticated client used to test game access control.
	let outsiderClient = null;

	// Always close clients and the temporary server after the test.
	t.after(async () => {
		whiteClient.disconnect();
		blackClient.disconnect();

		if (reconnectedBlackClient)
			reconnectedBlackClient.disconnect();

		if (outsiderClient)
			outsiderClient.disconnect();

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

	// Register state listeners before asking both clients to join the game.
	const whiteInitialState = waitForEvent(
		whiteClient,
		'game:state',
	);

	const blackInitialState = waitForEvent(
		blackClient,
		'game:state',
	);

	whiteClient.emit('game:join', { gameId: whiteGame.gameId });
	blackClient.emit('game:join', { gameId: blackGame.gameId });

	const [
		initialStateForWhite,
		initialStateForBlack,
	] = await Promise.all([
		whiteInitialState,
		blackInitialState,
	]);

	// Both players must receive the same initial server position.
	assert.deepEqual(initialStateForWhite, initialStateForBlack);
	assert.equal(initialStateForWhite.turn, 'w');

	const whiteMoveState = waitForEvent(
		whiteClient,
		'game:state',
	);

	const blackMoveState = waitForEvent(
		blackClient,
		'game:state',
	);

	// The client sends only the game and chess move data.
	// The backend derives playerId from the authenticated socket.
	whiteClient.emit('game:move', {
		gameId: whiteGame.gameId,
		from: 'e2',
		to: 'e4',
	});

	const [
		stateAfterMoveForWhite,
		stateAfterMoveForBlack,
	] = await Promise.all([
		whiteMoveState,
		blackMoveState,
	]);

	// The game room must receive one identical authoritative result.
	assert.deepEqual(stateAfterMoveForWhite, stateAfterMoveForBlack);
	assert.equal(stateAfterMoveForWhite.turn, 'b');
	assert.notEqual(stateAfterMoveForWhite.fen, initialStateForWhite.fen);

	// White attempts to move again while the server expects black.
	const outOfTurnErrorEvent = waitForEvent(
		whiteClient,
		'game:error',
	);

	whiteClient.emit('game:move', {
		gameId: whiteGame.gameId,
		from: 'g1',
		to: 'f3',
	});

	const outOfTurnError = await outOfTurnErrorEvent;

	// The server must enforce turn order independently of the frontend.
	assert.match(
		outOfTurnError.message,
		/turn/i,
	);

	// Black now attempts an illegal move from e7 directly to e4.
	const illegalMoveErrorEvent = waitForEvent(
		blackClient,
		'game:error',
	);

	blackClient.emit('game:move', {
		gameId: blackGame.gameId,
		from: 'e7',
		to: 'e4',
	});

	const illegalMoveError = await illegalMoveErrorEvent;

	// chess.js validation must reject the move without changing the position.
	assert.equal(illegalMoveError.message, 'Illegal move');

	// Simulate a temporary network interruption after the first legal move.
	blackClient.disconnect();

	reconnectedBlackClient = createClient(serverUrl, {
		auth: { userId: 2 },
		transports: ['websocket'],

		// Force a completely new Socket.IO connection for this user.
		forceNew: true,
	});

	await waitForEvent(
		reconnectedBlackClient,
		'connect',
	);

	const restoredStateEvent = waitForEvent(
		reconnectedBlackClient,
		'game:state',
	);

	// The reconnected frontend repeats game:join using its current route gameId.
	reconnectedBlackClient.emit('game:join', {
		gameId: blackGame.gameId,
	});

	const restoredState = await restoredStateEvent;

	// The backend keeps the authoritative game in memory during client disconnects.
	assert.deepEqual(
		restoredState,
		stateAfterMoveForBlack,
	);
	assert.equal(restoredState.turn, 'b');

	const whiteFinalStateEvent = waitForEvent(
		whiteClient,
		'game:state',
	);

	const blackFinalStateEvent = waitForEvent(
		reconnectedBlackClient,
		'game:state',
	);

	// The reconnected black player resigns from the active game.
	reconnectedBlackClient.emit('game:resign', {
		gameId: blackGame.gameId,

		// This forged value must be ignored by the backend.
		playerId: 1,
	});

	const [
		finalStateForWhite,
		finalStateForBlack,
	] = await Promise.all([
		whiteFinalStateEvent,
		blackFinalStateEvent,
	]);

	// Both connected participants receive the same completed game.
	assert.deepEqual(finalStateForWhite, finalStateForBlack);
	assert.equal(finalStateForWhite.status, 'COMPLETED');
	assert.equal(finalStateForWhite.result, 'WHITE_WIN');
	assert.equal(finalStateForWhite.winnerId, 1);
	assert.match(
		finalStateForWhite.pgn,
		/\[Result "1-0"\]/,
	);

	outsiderClient = createClient(serverUrl, {
		auth: { userId: 3 },
		transports: ['websocket'],
		forceNew: true,
	});

	await waitForEvent(
		outsiderClient,
		'connect',
	);

	const accessErrorEvent = waitForEvent(
		outsiderClient,
		'game:error',
	);

	// User 3 is authenticated but is not a participant in game 1.
	outsiderClient.emit('game:join', {
		gameId: whiteGame.gameId,
	});

	const accessError = await accessErrorEvent;

	// Authentication alone must not grant access to another user's game.
	assert.equal(
		accessError.message,
		'Player is not part of this game',
	);
});
