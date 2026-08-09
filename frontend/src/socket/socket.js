import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
})

export { socket }