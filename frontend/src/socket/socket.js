import { io } from 'socket.io-client'

const socket = io(window.location.origin, {
  autoConnect: false,
  withCredentials: true,
})

export { socket }