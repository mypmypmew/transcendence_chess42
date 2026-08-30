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

	socket.on('game:move', async ({
		gameId,
		from,
		to,
		promotion,
		} = {}) => {
			try {
				// Ignore any playerId supplied by the client.
				// GameService validates the move using the authenticated socket user.
				const game = await gameService.makeMove({
					gameId,
					playerId,
					from,
					to,
					promotion,
				});
	
				// Broadcast only the authoritative snapshot returned by GameService.
				// Both players in the room receive the same resulting position.
				io.to(`game:${gameId}`).emit(
					'game:state',
					game,
				);
			} catch (error) {
				// Send move validation failures only to the requesting client.
				// No room broadcast occurs because the server state did not change.
				const message =
				error instanceof Error
					? error.message
					: 'Unable to make the move';
				
				socket.emit('game:error', {
					message,
				});
			}
		},
	);

	socket.on('game:resign', async ({ gameId } = {}) => {
		// Ignore any playerId supplied by the client.
		// GameService resigns only the authenticated socket user.
		const game = await gameService.resignGame({
			gameId,
			playerId,
		});

		// Broadcast the final authoritative result to both participants.
		io.to(`game:${gameId}`).emit(
			'game:state',
			game,
		);
	});
}

module.exports = {
	registerGameHandlers,
};
