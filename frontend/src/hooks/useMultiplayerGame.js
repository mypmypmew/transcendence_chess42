import { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketContext.jsx'

function useMultiplayerGame(gameId) {
	const { socket, status: socketStatus } = useSocket()
	const [game, setGame] = useState(null)
	const [gameError, setGameError] = useState(null)

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
		}

		// Show game-specific backend errors withput disconnecting the shared socket.
		function handleGameError(payload) {
			setGameError(payload?.message || 'Unable to load the game')
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

	return {
		game,
		gameError: isValidGameId ? gameError : 'Invalid game ID',
		isLoading: isValidGameId && game === null && gameError === null,
		socketStatus
	}
}

export default useMultiplayerGame
