// Points awarded for one completed game.
// Unfinished and cancelled games must not call this function.
function getGamePoints(result) {
	switch (result) {
		case 'WHITE_WIN':
			return { white: 100, black: 0 };
		case 'BLACK_WIN':
			return { white: 0, black: 100 };
		case 'DRAW':
			return { white: 30, black: 30 };
		default:
			throw new TypeError('Invalid game result');
	}
}

// Recalculate totals from completed games, independently of stored ratings.
function calculatePlayerPoints(players, games) {
	const totals = new Map(players.map((player) => [
		player.id,
		{
			id: player.id,
			username: player.username,
			previousPoints: player.rating,
			points: 0,
			completedGames: 0,
		},
	]));

	for (const game of games) {
		if (game.status !== 'COMPLETED') {
			continue;
		}

		const white = totals.get(game.whiteId);
		const black = totals.get(game.blackId);

		if (!white || !black || game.whiteId === game.blackId) {
			throw new Error('Completed game has invalid participants');
		}

		const points = getGamePoints(game.result);

		white.points += points.white;
		black.points += points.black;
		white.completedGames += 1;
		black.completedGames += 1;
	}

	return [...totals.values()];
}

module.exports = {
	getGamePoints,
	calculatePlayerPoints,
};
