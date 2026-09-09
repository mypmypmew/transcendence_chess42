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

function getWeeklyActivity(games, userId, now = new Date()) {
	// Use local calendar boundaries so daylight-saving changes are handled correctly.
	const today = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	)

	// Include today and the previous six days, even when no games were completed.
	const days = Array.from({ length: 7 }, (_, index) => {
		const start = new Date(today)
		start.setDate(today.getDate() - 6 + index)

		const end = new Date(start)
		end.setDate(start.getDate() + 1)

		return {
			start,
			end,
			count: 0,
		}
	})

	// Count each completed game on its local finish date.
	for (const game of games) {
		if (game.status !== 'COMPLETED' ||
			(game.white.id !== userId && game.black.id !== userId) ||
			!game.endedAt
		) {
			continue
		}

		const endedAt = new Date(game.endedAt)

		// Ignore invalid timestamps and finishes that are still in the future.
		if (Number.isNaN(endedAt.getTime()) || endedAt > now) {
			continue
		}

		const day = days.find(({ start, end }) => (
			endedAt >= start && endedAt < end
		))

		if (day) {
			day.count += 1
		}
	}

	// Return chart data in chronological order without exposing internal boundaries.
	return days.map(({ start, count }) => ({
		date: start.getTime(),
		label: start.toLocaleDateString('en-US', { weekday: 'short' }),
		count,
	}))
}

export { getGameStatistics, getWeeklyActivity }
