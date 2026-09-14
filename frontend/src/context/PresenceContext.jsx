import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useAuth } from './AuthContext.jsx'
import { useSocket } from './SocketContext.jsx'

const PresenceContext = createContext(null)

const EMPTY_PRESENCE = {
  userId: null,
  onlineUserIds: new Set(),
  isAvailable: false,
}

function PresenceProvider({ children }) {
  const { user } = useAuth()
  const { socket } = useSocket()
  const userId = user?.id ?? null
  const [presence, setPresence] = useState(EMPTY_PRESENCE)

  useEffect(() => {
    if (!userId) {
      return undefined
    }

    let isActive = true

    function loadPresence() {
      socket.emit('presence:list', (reply) => {
        if (!isActive) {
          return
        }

        if (!reply || reply.error || !Array.isArray(reply.online)) {
          setPresence({ userId, onlineUserIds: new Set(), isAvailable: false })
          return
        }

        setPresence({ userId, onlineUserIds: new Set(reply.online), isAvailable: true })
      })
    }

    socket.on('connect', loadPresence)

    if (socket.connected) {
      loadPresence()
    }

    return () => {
      isActive = false
      socket.off('connect', loadPresence)
    }
  }, [socket, userId])

  const current = presence.userId === userId ? presence : EMPTY_PRESENCE

  const getStatus = useCallback((targetUserId) => {
    if (!current.isAvailable) {
      return 'unavailable'
    }

    return current.onlineUserIds.has(targetUserId) ? 'online' : 'offline'
  }, [current])

  const value = useMemo(() => ({
    isAvailable: current.isAvailable,
    onlineUserIds: current.onlineUserIds,
    getStatus,
  }), [current, getStatus])

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  )
}

function usePresence() {
  const context = useContext(PresenceContext)

  if (!context) {
    throw new Error('usePresence must be used inside PresenceProvider')
  }

  return context
}

// eslint-disable-next-line react-refresh/only-export-components
export { PresenceProvider, usePresence }