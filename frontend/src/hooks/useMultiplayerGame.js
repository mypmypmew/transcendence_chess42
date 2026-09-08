import { useEffect, useState } from 'react'
import { Chess } from 'chess.js'
import { useSocket } from '../context/SocketContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getGame as getGameDetails } from '../api/gameApi.js'

function getPlayerColor(game, userId) {
	// Match the authenticated user with the color assigned by the backend.
	if (game?.whiteId === userId) {
		return 'w'
	}

	if (game?.blackId === userId) {
		return 'b'
	}

	return null
}

function getOpponent(gameDetails, userId) {
	if (!gameDetails || !userId) {
		return null
	}

	// Select the other participant relative to the authenticated player.
	if (gameDetails.white?.id === userId) {
		return gameDetails.black
	}

	if (gameDetails.black?.id === userId) {
		return gameDetails.white
	}

	return null
}

function createPosition(fen) {
	if (!fen) {
		return null
	}

	try {
		// Read the authoritative FEN only for UI messages without changing the server state.
		return new Chess(fen)
	} catch {
		return null
	}
}

function getWinnerLabel(result) {
	if (result === 'WHITE_WIN') {
		return 'White'
	}

	if (result === 'BLACK_WIN') {
		return 'Black'
	}

	return null
}

function getGameOverInfo(game) {
	if (game?.status !== 'COMPLETED') {
		return null
	}

	const position = createPosition(game.fen)

	if (game.result === 'DRAW') {
		return {
			type: position?.isStalemate() ? 'stalemate' : 'draw',
		}
	}

	const winner = getWinnerLabel(game.result)

	if (!winner) {
		return null
	}

	// A completed win without checkmate is currently produced by resignation.
	return {
		type: position?.isCheckmate() ? 'checkmate' : 'resignation',
		winner,
	}
}

function getDisplayStatus(game, playerColor, socketStatus) {
	if (!game) {
		return socketStatus === 'connected'
			? 'Loading game...'
			: 'Connecting...'
	}

	const gameOverInfo = getGameOverInfo(game)

	if (gameOverInfo?.type === 'stalemate') {
		return 'Stalemate'
	}

	if (gameOverInfo?.type === 'draw') {
		return 'Draw'
	}

	if (gameOverInfo?.winner) {
		return `${gameOverInfo.winner} wins`
	}

	if (socketStatus !== 'connected') {
		return 'Connection lost'
	}

	const turnLabel =
		game.turn === playerColor
			? 'Your turn'
			: "Opponent's turn"

	const position = createPosition(game.fen)

	return position?.isCheck()
		? `${turnLabel} - check`
		: turnLabel
}

function useMultiplayerGame(gameId) {
	const { user } = useAuth()
	const { socket, status: socketStatus } = useSocket()
	const [game, setGame] = useState(null)
	const [gameError, setGameError] = useState(null)
	// Keep participant details separate from the frequently updated Socket.IO snapshot.
	const [gameDetails, setGameDetails] = useState(null)
	const [gameDetailsError, setGameDetailsError] = useState(null)
	// Block repeated actions while the backend validates the previous request.
	const [isWaitingForServer, setIsWaitingForServer] = useState(false)
	const isValidGameId = Number.isInteger(gameId) && gameId > 0
	const playerColor = getPlayerColor(game, user?.id)
	const opponent = getOpponent(gameDetails, user?.id)
	// Show the board from the side assigned to the authenticated player.
	const boardOrientation = playerColor === 'b' ? 'black' : 'white'
	// Enable moves only when the server reports this player's turn.
	const isPlayerTurn =
		game?.status === 'IN_PROGRESS' &&
		game.turn === playerColor
	const isGameOver = game?.status === 'COMPLETED'
	const gameOverInfo = getGameOverInfo(game)
	const displayStatus = getDisplayStatus(game, playerColor, socketStatus)

	useEffect(() => {
		if (!isValidGameId) {
			return undefined
		}

		let isCancelled = false

		async function loadGameDetails() {
			try {
				// REST supplies stable participant details that are not repeated in socket snapshots.
				const response = await getGameDetails(gameId)

				if (!isCancelled) {
					setGameDetails(response.game)
					setGameDetailsError(null)
				}
			} catch (error) {
				if (!isCancelled) {
					setGameDetails(null)
					setGameDetailsError(
						error?.message || 'Unable to load opponent details'
					)
				}
			}
		}

		loadGameDetails()

		// Ignore a late response after leaving this game route.
		return () => {
			isCancelled = true
		}
	}, [gameId, isValidGameId])

	useEffect(() => {
		if (!isValidGameId) {
			return undefined
		}

		// Accept only snapshots that belong to the game opened in the current route.
		function handleGameState(serverGame) {
			if (serverGame?.gameId !== gameId) {
				return
			}
			
			setGame(serverGame)
			setGameError(null)
			// The authoritative response completes any pending move or resignation request.
			setIsWaitingForServer(false)
		}

		// Show game-specific backend errors withput disconnecting the shared socket.
		function handleGameError(payload) {
			setGameError(payload?.message || 'Unable to load the game')

			// An error is also a completed server response, so controls may become available again.
			setIsWaitingForServer(false)
		}

		// Join again after every connection so a refreshed or reconnected client receives the latest server state.
		function joinGame() {
			socket.emit('game:join', {
				gameId,
			})
		}

		socket.on('game:state', handleGameState)
		socket.on('game:error', handleGameError)
		socket.on('connect', joinGame)

		// The socket may already be connected before the game page is mounted.
		if (socket.connected) {
			joinGame()
		}

		// Prevent duplicate handlers when the route changes or the component unmounts.
		return () => {
			socket.off('game:state', handleGameState)
			socket.off('game:error', handleGameError)
			socket.off('connect', joinGame)
		}
	}, [gameId, isValidGameId, socket])

	function makeMove(from, to, promotion = 'q') {
		// Do not send moves before the game is loaded or after it has finished.
		if (!socket.connected ||
			!game || game.status !== 'IN_PROGRESS' ||
			isWaitingForServer
		) {
			return false
		}

		setGameError(null)
		setIsWaitingForServer(true)

		// Send only move data because the backend gets playerId from the authenticated socket.
		socket.emit('game:move', {
			gameId,
			from,
			to,
			promotion
		})

		return true
	}

	function resignGame() {
		// Prevent duplicate resignation requests and invalid actions on completed games.
		if (!socket.connected ||
			!game ||
			game.status !== 'IN_PROGRESS' ||
			isWaitingForServer
		) {
			return false
		}

		setGameError(null)
		setIsWaitingForServer(true)

		// The backend determines the resigning player from the authenticated socket session.
		socket.emit('game:resign', {
			gameId,
		})
	}

	return {
		game,
		gameDetails,
		opponent,
		gameDetailsError,
		gameError: isValidGameId ? gameError : 'Invalid game ID',
		isLoading: isValidGameId && game === null && gameError === null,
		isWaitingForServer,
		socketStatus,
		playerColor,
		boardOrientation,
		isPlayerTurn,
		isGameOver,
		gameOverInfo,
		displayStatus,
		makeMove,
		resignGame,
	}
}

export default useMultiplayerGame
