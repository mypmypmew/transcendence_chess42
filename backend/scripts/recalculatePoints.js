const prisma = require('../src/db/prisma');
const { recalculatePoints } = require('../src/services/pointsRecalculationService');

async function main() {
	const args = process.argv.slice(2);

	if (args.length > 1 || (args.length === 1 && args[0] !== '--apply')) {
		throw new Error('Usage: node scripts/recalculatePoints.js [--apply]');
	}

	const apply = args[0] === '--apply';

	if (apply) {
		console.log('Apply mode: the backend must be stopped before running this command.');
	}

	const totals = await recalculatePoints({ apply });
	const changedPlayers = totals.filter(
		(player) => player.previousPoints !== player.points,
	).length;

	console.table(totals);
	console.log(
		apply
			? `Updated ${changedPlayers} player(s).`
			: `Preview only: ${changedPlayers} player(s) would change. No data written.`,
	);
}

async function run() {
	try {
		await main();
	} catch (error) {
		console.error('Points recalculation failed:', error.message);
		process.exitCode = 1;
	} finally {
		await prisma.$disconnect();
	}
}

run().catch((error) => {
	console.error('Failed to disconnect from the database:', error.message);
	process.exitCode = 1;
});
