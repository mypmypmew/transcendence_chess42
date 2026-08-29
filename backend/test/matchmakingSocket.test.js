const test = require('node:test');
const assert = require('node:assert/strict');

const {
	registerMatchmakingHandlers,
} = require('../src/socket/matchmakingSocket');

test('joins matchmaking with the authenticated socket user', async () => {
  // Store registered Socket.IO handlers so the test can invoke them directly.
  const handlers = new Map();
  const emittedEvents = [];
  let joinedPlayerId = null;

  const fakeSocket = {
	// socketAuth stores the authenticated database user ID here.
	data: {
		userId: 7,
	},

	// Capture event handlers instead of opening a real network connection.
	on(eventName, handler) {
		handlers.set(eventName, handler);
	},

	// Provide the room API that the real Socket.IO socket exposes.
	join() {
		// Room membership is verified in a dedicated test below.
	},

	// Capture events that would normally be sent to the frontend.
	emit(eventName) {
		emittedEvents.push(eventName);
	},
  };

  const fakeMatchmakingService = {
	async join(playerId) {
		joinedPlayerId = playerId;

		return {
			status: 'WAITING',
		};
	},
  };

  registerMatchmakingHandlers({
	socket: fakeSocket,
	matchmakingService: fakeMatchmakingService,
  });

  const joinHandler = handlers.get('matchmaking:join');

  // Send a forged userId to prove that client payload is ignored.
  await joinHandler({
	userId: 999,
  });
  
  // The handler must use the authenticated user from socket.data.
  assert.equal(joinedPlayerId, 7);

  // The waiting event tells the frontend that no opponent is available yet.
  assert.deepEqual(emittedEvents, [
	'matchmaking:waiting',
  ]);
});

test('joins a personal room for the authenticated user', () => {
	// Store room names to verify where the socket is registered.
	const joinedRooms = [];

	const fakeSocket = {
		data: {
			userId: 7,
		},

		on() {
			// Event registration is not relevant to this room test.
		},

		emit() {
			// No client event is expected during handler registration.
		},

		join(roomName) {
			joinedRooms.push(roomName);
		},
  	};

	const fakeMatchmakingService = {
		async join() {
			return {
				status: 'WAITING',
			};
		},
	};

	// Registering handlers must also place the authenticated socket into a stable room based on its database user ID.
	registerMatchmakingHandlers({
		socket: fakeSocket,
		matchmakingService: fakeMatchmakingService,
	});

	assert.deepEqual(joinedRooms, [
		'user:7',
	]);
});
