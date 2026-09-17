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

module.exports = {
	getGamePoints,
};
