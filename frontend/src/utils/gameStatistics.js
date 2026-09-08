function getGameStatistics(games, userId) {
	// Include only completed games involving the current user.
	const completedGames = games.filter((game) => (
		game.status === 'COMPLETED'
		&& (game.white.id === userId || game.black.id === userId)
	))

	// Count wins by user ID, regardless of the player's color.
	const totalGames = completedGames.length
	const wins = completedGames.filter((game) => (
		game.winnerId === userId
	)).length

	// Draws count in the denominator; no games means no win rate yet.
	const winRate = totalGames === 0
		? null
		: Math.round((wins / totalGames) * 100)
	
	// Select the five latest finishes without changing the original array.
	// Use the game ID to break ties when completion times are equal.
	const recentGames = [...completedGames]
		.sort((a, b) => (
			new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime()
			|| b.id - a.id
		))
		.slice(0, 5)
	
	return {
		totalGames,
		wins,
		winRate,
		recentGames,
	}
}

export { getGameStatistics }
