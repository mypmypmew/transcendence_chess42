import test from 'node:test'
import assert from 'node:assert/strict'

import { getGameStatistics } from '../src/utils/gameStatistics.js'

// Build independent game records using the existing API response shape.
function createGame(overrides = {}) {
	return {
		id: 1,
		status: 'COMPLETED',
		result: 'WHITE_WIN',
		winnerId: 7,
		white: { id: 7, username: 'WhitePlayer' },
		black: { id: 8, username: 'BlackPlayer' },
		endedAt: '2026-09-01T12:00:00.000Z',
		...overrides,
	}
}

// An empty history must not produce a misleading numeric win rate.
test('returns empty statistics when the user has no games', () => {
	assert.deepEqual(getGameStatistics([], 7), {
		totalGames: 0,
		wins: 0,
		winRate: null,
		recentGames: [],
	})
})

// Wins as either color count; draws remain in the denominator.
test('counts wins for both colors and includes losses and draws', () => {
	const games = [
		createGame({ id: 1 }),
		createGame({
			id: 2,
			white: { id: 8, username: 'WhitePlayer' },
			black: { id: 7, username: 'BlackPlayer' },
			result: 'BLACK_WIN',
			winnerId: 7,
		}),
		createGame({
			id: 3,
			result: 'BLACK_WIN',
			winnerId: 8,
		}),
		createGame({
			id: 4,
			result: 'DRAW',
			winnerId: null,
		}),
	]

	const statistics = getGameStatistics(games, 7)

	assert.equal(statistics.totalGames, 4)
	assert.equal(statistics.wins, 2)
	assert.equal(statistics.winRate, 50)
})

// Pending, cancelled and unrelated games must not affect any output.
test('excludes unfinished, cancelled and other users games', () => {
	const games = [
		createGame({
			id: 1,
			status: 'IN_PROGRESS',
			result: null,
			winnerId: null,
			endedAt: null,
		}),
		createGame({
			id: 2,
			status: 'CANCELLED',
			result: null,
			winnerId: null,
			endedAt: null,
		}),
		createGame({
			id: 3,
			white: { id: 8, username: 'WhitePlayer' },
			black: { id: 9, username: 'BlackPlayer' },
			winnerId: 7,
		}),
	]

	assert.deepEqual(getGameStatistics(games, 7), {
		totalGames: 0,
		wins: 0,
		winRate: null,
		recentGames: [],
	})
})

// A played history without wins differs from an empty history.
test('returns zero percent when completed games contain no wins', () => {
	const games = [
		createGame({ result: 'BLACK_WIN', winnerId: 8 }),
		createGame({ id: 2, result: 'DRAW', winnerId: null }),
	]

	const statistics = getGameStatistics(games, 7)

	assert.equal(statistics.totalGames, 2)
	assert.equal(statistics.wins, 0)
	assert.equal(statistics.winRate, 0)
})

test('rounds the win rate to a whole percentage', () => {
	const games = [
		createGame(),
		createGame({ id: 2, result: 'BLACK_WIN', winnerId: 8 }),
		createGame({ id: 3, result: 'DRAW', winnerId: null }),
	]

	assert.equal(getGameStatistics(games, 7).winRate, 33)
})

// Recent games follow finish time, with descending IDs for equal times.
// The full history still determines statistics, even when only five are shown.
test('selects five latest finishes without changing the input', () => {
	const games = [
		createGame({ id: 90, endedAt: '2026-09-01T12:00:00.000Z' }),
		createGame({ id: 2, endedAt: '2026-09-06T12:00:00.000Z' }),
		createGame({ id: 3, endedAt: '2026-09-03T12:00:00.000Z' }),
		createGame({ id: 4, endedAt: '2026-09-06T12:00:00.000Z' }),
		createGame({ id: 5, endedAt: '2026-09-05T12:00:00.000Z' }),
		createGame({ id: 6, endedAt: '2026-09-02T12:00:00.000Z' }),
		createGame({ id: 7, endedAt: '2026-09-04T12:00:00.000Z' }),
	]

	const originalGames = structuredClone(games)

	const statistics = getGameStatistics(games, 7)

	assert.deepEqual(statistics.recentGames.map((game) => game.id),
		[4, 2, 5, 7, 3],
	)
	assert.equal(statistics.totalGames, 7)
	assert.equal(statistics.wins, 7)
	assert.equal(statistics.winRate, 100)
	assert.deepEqual(games, originalGames)
})
