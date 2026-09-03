import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext.jsx'

function useMatchmaking() {
	const navigate = useNavigate()
	const { socket, status: socketStatus } = useSocket()
	const [isSearching, setIsSearching] = useState(false)
	const [matchmakingError, setMatchmakingError] = useState(null)

	useEffect(() => {
		// Keep the lobby state synchronized with matchmaking responses from the backend.
		function handleWaiting() {
			setIsSearching(true)
			setMatchmakingError(null)
		}

		// Open the server-created game after validating its database ID.
		function handleMatched(game) {
			if (!Number.isInteger(game?.gameId) || game.gameId <= 0) {
				setIsSearching(false)
				setMatchmakingError('Matchmaking returned an invalid game')
				return
			}

			setIsSearching(false)
			setMatchmakingError(null)
			navigate(`/game/${game.gameId}`)
		}

		// Stop the loading state and show the backend error to the current player.
		function handleMatchmakingError(payload) {
			setIsSearching(false)
			setMatchmakingError(
				payload?.message || 'Unable to join matchmaking',
			)
		}

		socket.on('matchmaking:waiting', handleWaiting)
		socket.on('matchmaking:matched', handleMatched)
		socket.on('matchmaking:error', handleMatchmakingError)

		// Remove only this hook's listeners when the lobby is unmounted.
		return () => {
			socket.off('matchmaking:waiting', handleWaiting)
			socket.off('matchmaking:matched', handleMatched)
			socket.off('matchmaking:error', handleMatchmakingError)
		}
	}, [socket, navigate])

	useEffect(() => {
		return () => {
			// Remove this user from matchmaking when the lobby is closed or replaced by the game page.
			// The backend safely ignores this event if the user was already matched or cancelled.
			if (socket.connected) {
				socket.emit('matchmaking:leave')
			}
		}
	}, [socket])

	function startSearch() {
		// Do not emit matchmaking events before the authenticated socket is connected.
		if (!socket.connected) {
			setMatchmakingError('Real-time connection is unavailable')
			return false
		}

		setIsSearching(true)
		setMatchmakingError(null)
		socket.emit('matchmaking:join')

		return true
	}

	function cancelSearch() {
		// Notify the backend when possible and always reset the local lobby state.
		if (socket.connected) {
			socket.emit('matchmaking:leave')
		}

		setIsSearching(false)
		setMatchmakingError(null)
	}

	return {
		socketStatus,
		isSearching,
		matchmakingError,
		startSearch,
		cancelSearch,
	}
}

export default useMatchmaking
