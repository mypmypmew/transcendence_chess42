// Shared reference content for Training and the in-game rules dialog.
export const chessGuideSections = [
	{
		id: 'basics',
		title: 'Game basics',
		items: [
			{
				title: 'Taking turns',
				text: 'White starts. Players alternate moves. Captured pieces leave the board.',
			},
			{
				title: 'King safety',
				text: 'Never leave your king attacked. Kings are checkmated, not captured.',
			},
		],
	},

	// Explain movement without analysing the current game position.
	{
		id: 'pieces',
		title: 'Pieces and movement',
		items: [
			{
				title: 'King',
				text: 'One square in any direction, avoiding attacked squares.',
			},
			{
				title: 'Queen',
				text: 'Any distance along a rank, file or diagonal.',
			},
			{
				title: 'Rook',
				text: 'Any distance horizontally or vertically.',
			},
			{
				title: 'Bishop',
				text: 'Any distance diagonally.',
			},
			{
				title: 'Knight',
				text: 'Two squares along one axis and one along the other. Can jump over pieces.',
			},
			{
				title: 'Pawn',
				text: 'Moves forward one square; optionally two initially if both squares are empty. Captures one square diagonally forward.',
			},
			{
				title: 'Blocking',
				text: 'Except knights, pieces cannot jump. You cannot land on your own piece.',
			},
		],
	},

	// Distinguish checkmate from stalemate.
	{
		id: 'endings',
		title: 'Check, checkmate and stalemate',
		items: [
			{
				title: 'Check',
				text: 'Your king is attacked. Your next move must remove the attack.',
			},
			{
				title: 'Checkmate',
				text: 'Check with no legal escape: you lose.',
			},
			{
				title: 'Stalemate',
				text: 'No legal move, but no check: a draw.',
			},
		],
	},

	// Include the conditions that make special moves legal.
	{
		id: 'special-moves',
		title: 'Special moves',
		items: [
			{
				title: 'Castling',
				text: 'Move the king two squares toward a rook; move that rook beside it on the other side. Neither may have moved; intervening squares must be empty. The king cannot start in, cross or enter check.',
			},
			{
				title: 'Promotion',
				text: 'A pawn reaching the final rank becomes a queen, rook, bishop or knight of its color.',
			},
			{
				title: 'En passant',
				text: 'Immediately after an adjacent enemy pawn advances two squares, capture it as though it advanced one.',
			},
		],
	},
]
