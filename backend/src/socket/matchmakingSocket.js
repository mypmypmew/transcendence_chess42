function registerMatchmakingHandlers({socket, matchmakingService,} = {}) {
	// Require the minimal Socket.IO interface used by these handlers.
	// this also makes dependency errors clear in unit tests.
	if (!socket ||
		typeof socket.on !== 'function' ||
		typeof socket.emit !== 'function'
	) {
		throw new TypeError('socket with on and emit methods is required');
	}
	
	// Matchmaking behavior remains inside MatchmakingService.
	// the socket layer only translates events into service calls.
	if (!matchmakingService ||
		typeof matchmakingService.join !== 'function'
	) {
		throw new TypeError('matchmakingService with a join method is required');
	}

	socket.on('matchmaking:join', async () => {
		// Never accept userId from the client payload.
		// socketAuth has already stored the authenticated user here.
		const playerId = socket.data.userId;

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
