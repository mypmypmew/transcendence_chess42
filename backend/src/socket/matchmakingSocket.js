function registerMatchmakingHandlers({socket, matchmakingService,} = {}) {
	// Require the minimal Socket.IO interface used by these handlers.
	// this also makes dependency errors clear in unit tests.
	if (!socket ||
		typeof socket.on !== 'function' ||
		typeof socket.emit !== 'function' ||
		typeof socket.join !== 'function'
	) {
		throw new TypeError('socket with on, emit and join methods is required');
	}
	
	// Matchmaking behavior remains inside MatchmakingService.
	// the socket layer only translates events into service calls.
	if (!matchmakingService ||
		typeof matchmakingService.join !== 'function'
	) {
		throw new TypeError('matchmakingService with a join method is required');
	}

	// Read the identity established by socketAuth once for this connection.
	const playerId = socket.data.userId;

	// Join a stable personal room so future matchmaking events can reach every active socket that belongs to this user.
	socket.join(`user:${playerId}`);

	socket.on('matchmaking:join', async () => {
		// Never accept userId from the client payload.
		// Use only the identity that socketAuth stored on this connection.
		const result = await matchmakingService.join(playerId);

		// Tell the current client that it remains in the matchmaking queue.
		if (result.status === 'WAITING') {
			socket.emit('matchmaking:waiting');
		}
	});
}

module.exports = {
	registerMatchmakingHandlers,
};
