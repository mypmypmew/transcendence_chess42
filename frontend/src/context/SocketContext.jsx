import { 
    createContext, 
    useCallback,
    useContext, 
    useEffect, 
    useMemo, 
    useState 
} from 'react'

import { socket } from '../socket/socket.js'
import { useAuth } from './AuthContext.jsx'

const SocketContext = createContext(null)

function SocketProvider({ children }) {
  const { user, isAuthenticated, isAuthLoading } = useAuth()
  const userId = user?.id
  const [ratingsVersion, setRatingsVersion] = useState(0)
  const [status, setStatus] = useState(
    socket.connected ? 'connected' : 'disconnected',
  )
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      return undefined
    }

    const completedGames = new Set()

    function invalidateRatings() {
      setRatingsVersion((version) => version + 1)
    }

    function handleGameState(game) {
      if (
        game?.status !== 'COMPLETED'
        || !Number.isInteger(game.gameId)
        || (game.whiteId !== userId && game.blackId !== userId)
        || completedGames.has(game.gameId)
      ) {
        return
      }

      completedGames.add(game.gameId)
      invalidateRatings()
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        invalidateRatings()
      }
    }

    socket.on('game:state', handleGameState)
    socket.on('connect', invalidateRatings)
    window.addEventListener('focus', invalidateRatings)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      socket.off('game:state', handleGameState)
      socket.off('connect', invalidateRatings)
      window.removeEventListener('focus', invalidateRatings)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [userId])

  useEffect(() => {
    function handleConnect() {
      setStatus('connected')
      setError(null)
    }

    function handleDisconnect() {
      setStatus('disconnected')
    }

    function handleConnectError(connectionError) {
      setStatus('error')
      setError(connectionError.message)
    }

    function handleReconnectAttempt() {
      setStatus('connecting')
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.io.on('reconnect_attempt', handleReconnectAttempt)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.io.off('reconnect_attempt', handleReconnectAttempt)
      socket.disconnect()
    }
  }, [])

    const connect = useCallback(() => {
    if (socket.connected) {
        return
    }

    setStatus('connecting')
    setError(null)
    socket.connect()
    }, [])

    const disconnect = useCallback(() => {
    socket.disconnect()
    setStatus('disconnected')
    setError(null)
    }, [])

    useEffect(() => {
      if (isAuthLoading) {
        return
      }

      if (isAuthenticated) {
        socket.connect()
        return
      }

      socket.disconnect()
    }, [isAuthenticated, isAuthLoading])

    const value = useMemo(() => ({
        socket,
        status,
        error,
        connect,
        disconnect,
        ratingsVersion,
    }), [status, error, connect, disconnect, ratingsVersion])

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

function useSocket() {
  const context = useContext(SocketContext)

  if (!context) {
    throw new Error('useSocket must be used inside SocketProvider')
  }

  return context
}

// Same temporary pattern as ThemeContext.
// eslint-disable-next-line react-refresh/only-export-components
export { SocketProvider, useSocket }
