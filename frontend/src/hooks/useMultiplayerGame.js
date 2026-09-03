import { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketContext.jsx'

function useMultiplayerGame(gameId) {
	const { socket, status: socketStatus } = useSocket()
	const [game, setGame] = useState(null)
	const [gameError, setGameError] = useState(null)
	// Block repeated actions while the backend validates the previous request.
	const [isWaitingForServer, setIsWaitingForServer] = useState(false)

	const isValidGameId = Number.isInteger(gameId) && gameId > 0

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
		gameError: isValidGameId ? gameError : 'Invalid game ID',
		isLoading: isValidGameId && game === null && gameError === null,
		isWaitingForServer,
		socketStatus,
		makeMove,
		resignGame,
	}
}

export default useMultiplayerGame
