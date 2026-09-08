class MatchmakingService {
	constructor({ gameService } = {}) {
		// Matchmaking delegates actual game creation to GameService.
		// Validating the dependency here prevents a later unclear runtime error.
		if (
			!gameService ||
			typeof gameService.createGame !== 'function'
		) {
			throw new TypeError(
				'gameService with a createGame method is required',
			);
		}

		this.gameService = gameService;

		// Store the first player until another authenticated player joins.
		// null means that the matchmaking queue is currently empty.
		this.waitingPlayerId = null;
	}

	async join(playerId) {
		// Only positive database user IDs may enter matchmaking.
		if (!Number.isInteger(playerId) || playerId <= 0)
			throw new TypeError('playerId must be a positive integer');

		// The first player occupies the waiting slot and waits for an opponent.
		if (this.waitingPlayerId === null) {
			this.waitingPlayerId = playerId;

			return {
				status: 'WAITING',
			};
		}

		// Reject duplicate requests from the player who already occupies the queue.
		// This prevents GameService from receiving the same user as both opponents.
		if (this.waitingPlayerId === playerId) {
			throw new Error('Player is already waiting for a match');
		}

		// Preserve both player IDs before clearing the waiting slot.
		// The first player receives white and the second player receives black.
		const whiteId = this.waitingPlayerId;
		const blackId = playerId;

		// Clear the slot before awaiting game creation.
		// This prevents another join request from matching the same waiting player.
		this.waitingPlayerId = null;

		// Delegate authoritative game creation and persistence to GameService.
		const game = await this.gameService.createGame({
			whiteId,
			blackId,
		});

		// Return the same server snapshot that Socket.IO will send to both players.
		return {
			status: 'MATCHED',
			game,
		};
	}

	leave(playerId) {
		// Apply the same user ID validation used by join().
		if (!Number.isInteger(playerId) || playerId <= 0) {
			throw new TypeError('playerId must be a positive integer');
		}

		// Return false when this user does not occupy the waiting slot.
		// This keeps cancellation idempotent (safe repeated cancellation) for repeated Socket.IO events.
		if (this.waitingPlayerId !== playerId) {
			return false;
		}

		// Clear the queue so the next user becomes the new waiting player.
		this.waitingPlayerId = null;

		return true;
	}
}

module.exports = {
	MatchmakingService,
};
