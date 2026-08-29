function registerMatchmakingHandlers({io, socket, matchmakingService,} = {}) {
	// io broadcasts match results to personal rooms of both players.
	if (!io ||
		typeof io.to !== 'function'
	) {
		throw new TypeError('io with a to method is required');
	}
	
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

			return;
		}

		// Broadcast the authoritative game snapshot to both personal rooms.
		// This also notifies the first playerId, whose original join request finished earlier with the WAITING status
		if (result.status === 'MATCHED') {
			const { game } = result;

			io.to(`user:${game.whiteId}`).emit(
				'matchmaking:matched',
				game,
			);

			io.to(`user:${game.blackId}`).emit(
				'matchmaking:matched',
				game,
			);
		}
	});
}

module.exports = {
	registerMatchmakingHandlers,
};
