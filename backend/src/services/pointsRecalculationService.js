const prisma = require('../db/prisma');
const { calculatePlayerPoints } = require('./gamePoints');

async function recalculatePoints({ apply = false } = {}) {
	if (typeof apply !== 'boolean') {
		throw new TypeError('apply must be a boolean');
	}

	return prisma.$transaction(async (tx) => {
		if (apply) {
			const activeGames = await tx.game.count({
				where: { status: 'IN_PROGRESS' },
			});

			if (activeGames > 0) {
				throw new Error('Cannot apply recalculation while games are in progress');
			}
		}

		const players = await tx.user.findMany({
			select: {
				id: true,
				username: true,
				rating: true,
			},
			orderBy: { id: 'asc' },
		});

		const games = await tx.game.findMany({
			where: { status: 'COMPLETED' },
			select: {
				whiteId: true,
				blackId: true,
				status: true,
				result: true,
			},
		});

		const totals = calculatePlayerPoints(players, games);

		if (apply) {
			for (const player of totals) {
				if (player.previousPoints !== player.points) {
					await tx.user.update({
						where: { id: player.id },
						data: { rating: player.points },
					});
				}
			}
		}

		return totals;
	});
}

module.exports = {
	recalculatePoints,
};
