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
