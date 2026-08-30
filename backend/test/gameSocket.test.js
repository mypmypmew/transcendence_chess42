const test = require('node:test');
const assert = require('node:assert/strict');

const { registerGameHandlers } = require('../src/socket/gameSocket');

test('joins an authenticated participant to the game room', async () => {
	const handlers = new Map();
	const joinedRooms = [];
	const emittedEvents = [];
	let requestedGameId = null;

	const game = {
		gameId: 42,
		whiteId: 1,
		blackId: 2,
		turn: 'w',
		status: 'IN_PROGRESS',
	};

	const fakeSocket = {
		data: { userId: 1 },

		// Capture registered event handlers for direct invocation in the test.
		on(eventName, handler) {
			handlers.set(eventName, handler);
		},

		// Capture the Socket.IO rooms joined by this connection.
		join(roomName) {
			joinedRooms.push(roomName);
		},

		// Capture events that would normally be sent to the frontend.
		emit(eventName, payload) {
			emittedEvents.push({
				eventName,
				payload,
			});
		},
	};

	const fakeIo = {
		to() {
			throw new Error('Room broadcast was not expected');
		},
	};

	const fakeGameService = {
		// Return the authoritative snapshot stored by GameService.
		getGame(gameId) {
			requestedGameId = gameId;
			return game;
		},
	};

	registerGameHandlers({
		io: fakeIo,
		socket: fakeSocket,
		gameService: fakeGameService,
	});

	const joinHandler = handlers.get('game:join');

	// Send a forged userId to prove that socket.data remains authoritative.
	await joinHandler({
		gameId: 42,
		userId: 999,
	});

	// GameService must receive only the requested numeric game ID.
	assert.equal(requestedGameId, 42);

	// The authenticated participant joins the shared game room.
	assert.deepEqual(joinedRooms, [
		'game:42',
	]);
	
	// The joining client immediately receives the latest server snapshot.
	assert.deepEqual(emittedEvents, [
		{
			eventName: 'game:state',
			payload: game,	
		},
	]);
});

test('rejects a user who is not part of the game', async () => {
	const handlers = new Map();
	const joinedRooms = [];
	const emittedEvents = [];

	const game = {
		gameId: 42,
		whiteId: 1,
		blackId: 2,
		turn: 'w',
		status: 'IN_PROGRESS',
	};

	const fakeSocket = {
		data: { userId: 3 },

		on(eventName, handler) {
			handlers.set(eventName, handler);
		},

		join(roomName) {
			joinedRooms.push(roomName);
		},

		emit(eventName, payload) {
			emittedEvents.push({
				eventName,
				payload,
			});
		},
	};

	const fakeIo = {
		to() {
			throw new Error('Room broadcast was not expected');
		},
	};

	const fakeGameService = {
		getGame() {
			return game;
		},
	};

	registerGameHandlers({
		io: fakeIo,
		socket: fakeSocket,
		gameService: fakeGameService,
	});

	const joinHandler = handlers.get('game:join');

	// User 3 is authenticated but is not white or black in this game.
	await joinHandler({
		gameId: 42,
	});

	// Unauthorized users must never enter the shared game room.
	assert.deepEqual(joinedRooms, []);
	
	// Return a namespaced error that the frontend can display.
	assert.deepEqual(emittedEvents, [
		{
			eventName: 'game:error',
			payload: {
				message: 'Player is not part of this game',
			},	
		},
	]);
});

test('broadcasts authoritative state after a valid move', async () => {
	const handlers = new Map();
	const roomEvents = [];
	let receivedMove = null;

	const updatedGame = {
		gameId: 42,
		whiteId: 1,
		blackId: 2,
		turn: 'b',
		status: 'IN_PROGRESS',
		fen: 'updated-fen',
	};

	const fakeSocket = {
		data: { userId: 1 },

		on(eventName, handler) {
			handlers.set(eventName, handler);
		},

		join() {
			// Room membership is covered by the game:join test.
		},

		emit() {
			// Successful moves are broadcast to the entire game room.
		},
	};

	const fakeIo = {
		// Capture io.to(room).emit(event, payload) broadcasts.
		to(roomName) {
			return {
				emit(eventName, payload) {
					roomEvents.push({
						roomName,
						eventName,
						payload,
					});
				},
			};
		},
	};

	const fakeGameService = {
		// getGame is required by the handler dependency contract.
		getGame() {
			return updatedGame;
		},

		// Capture the move that the socket layer sends to GameService.
		async makeMove(move) {
			receivedMove = move;
			return updatedGame;
		},
	};

	registerGameHandlers({
		io: fakeIo,
		socket: fakeSocket,
		gameService: fakeGameService,
	});

	const moveHandler = handlers.get('game:move');

	// Send a forged playerId to prove that client identity is ignored.
	await moveHandler({
		gameId: 42,
		playerId: 999,
		from: 'e2',
		to: 'e4',
		promotion: 'q',
	});

	// GameService receives the authenticated user from socket.data.
	assert.deepEqual(receivedMove, {
		gameId: 42,
		playerId: 1,
		from: 'e2',
		to: 'e4',
		promotion: 'q',
	});
	
	// Both players receive the exact authoritative snapshot returned by GameService.
	assert.deepEqual(roomEvents, [
		{
			roomName: 'game:42',
			eventName: 'game:state',
			payload: updatedGame,
		},
	]);
});

test('emits an error without broadcasting an invalid move', async () => {
	const handlers = new Map();
	const emittedEvents = [];
	const roomEvents = [];

	const fakeSocket = {
		data: { userId: 1 },

		on(eventName, handler) {
			handlers.set(eventName, handler);
		},

		join() {
			// Room membership is covered by the game:join test.
		},

		// Capture errors sent only to the requesting client.
		emit(eventName, payload) {
			emittedEvents.push({
				eventName,
				payload,
			});
		},
	};

	const fakeIo = {
		// Record broadcasts to prove that an invalid move sends none.
		to(roomName) {
			return {
				emit(eventName, payload) {
					roomEvents.push({
						roomName,
						eventName,
						payload,
					});
				},
			};
		},
	};

	const fakeGameService = {
		getGame() {
			return {
				gameId: 42,
				whiteId: 1,
				blackId: 2,
			};
		},

		// Simulate chess.js or turn validation rejecting the move.
		async makeMove() {
			throw new Error('Illegal move');
		},
	};

	registerGameHandlers({
		io: fakeIo,
		socket: fakeSocket,
		gameService: fakeGameService,
	});

	const moveHandler = handlers.get('game:move');

	await moveHandler({
		gameId: 42,
		from: 'e2',
		to: 'e5',
	});

	// Only the requesting client receives the validation error.
	assert.deepEqual(emittedEvents, [
		{
			eventName: 'game:error',
			payload: {
				message: 'Illegal move',
			},
		},
	]);
	
	// The server state did not change, so the room receives nothing.
	assert.deepEqual(roomEvents, []);
});

test('broadcasts the final state after an authenticated resignation', async () => {
	const handlers = new Map();
	const roomEvents = [];
	let receivedResignation = null;

	const finishedGame = {
		gameId: 42,
		whiteId: 1,
		blackId: 2,
		status: 'COMPLETED',
		result: 'BLACK_WIN',
		winnerId: 2,
	};

	const fakeSocket = {
		data: { userId: 1 },

		on(eventName, handler) {
			handlers.set(eventName, handler);
		},

		join() {
			// Room membership is covered by the game:join test.
		},

		emit() {
			// Successful moves are broadcast to the entire game room.
		},
	};

	const fakeIo = {
		to(roomName) {
			return {
				emit(eventName, payload) {
					roomEvents.push({
						roomName,
						eventName,
						payload,
					});
				},
			};
		},
	};

	const fakeGameService = {
		getGame() {
			return finishedGame;
		},

		// Capture the authenticated player passed by the socket layer.
		async resignGame(resignation) {
			receivedResignation = resignation;
			return finishedGame;
		},
	};

	registerGameHandlers({
		io: fakeIo,
		socket: fakeSocket,
		gameService: fakeGameService,
	});

	const resignHandler = handlers.get('game:resign');

	// Send a forged playerId to prove that client identity is ignored.
	await resignHandler({
		gameId: 42,
		playerId: 999,
	});

	assert.deepEqual(receivedResignation, {
		gameId: 42,
		playerId: 1,
	});
	
	// Both participants receive the final authoritative result.
	assert.deepEqual(roomEvents, [
		{
			roomName: 'game:42',
			eventName: 'game:state',
			payload: updatedGame,
		},
	]);
});
