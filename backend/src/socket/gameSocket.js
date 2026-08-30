function registerGameHandlers({
	io,
	socket,
	gameService,
} = {}) {
	// io will broadcast authoritative game states to both players.
	if (!io ||
		typeof io.to !== 'function'
	) {
		throw new TypeError('io with a to method is required');
	}

	// Require the Socket.IO methods used by the game handlers.
	if (!socket ||
		typeof socket.on !== 'function' ||		
		typeof socket.join !== 'function' ||		
		typeof socket.emit !== 'function'		
	) {
		throw new TypeError('socket with on, join and emit methods is required');
	}

	// GameService owns the authoritative chess state.
	if (!gameService ||
		typeof gameService.getGame !== 'function'		
	) {
		throw new TypeError('gameService with a getGame method is required');
	}

	// Use only the identity established by socketAuth.
	const playerId = socket.data.userId;

	socket.on('game:join', async ({ gameId } = {}) => {
		try {
			// Load the latest authoritative snapshot from the server.
			const game = await gameService.getGame(gameId);
	
			// Only the two participants may enter this game's Socket.IO room.
			if (playerId !== game.whiteId &&
				playerId !== game.blackId
			) {
				throw new Error('Player is not part of this game');
			}
	
			// Both players share one room for synchronized state broadcasts.
			await socket.join(`game:${gameId}`);
	
			// Immediately synchronize the joining client with the server state.
			socket.emit('game:state', game);
		} catch (error) {
			// Convert validation and access failures into a client event instead of allowing the socket handler promise to reject.
			const message =
				error instanceof Error
					? error.message
					: 'Unable to join the game';
			
			socket.emit('game:error', {
				message,
			});
		}
	});
}

module.exports = {
	registerGameHandlers,
};
