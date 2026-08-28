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

		// The first player occupies the waiting slot.
		if (this.waitingPlayerId === null)
			this.waitingPlayerId = playerId;

		// Game creation will be added when the second-player behavior is tested.
		return {
			status: 'WAITING',
		};
	}
}

module.exports = {
	MatchmakingService,
};
