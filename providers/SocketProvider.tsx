import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
} from 'react'
import { io, Socket } from 'socket.io-client'

interface ISocketContext {
  socket: Socket
  sendHowdy: (message?: string) => void
}

const SocketContext = createContext<ISocketContext | undefined>(undefined)

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  // Create and memoize the socket connection
  const socket = useMemo(
    () =>
      io(process.env.EXPO_PUBLIC_SOCKET_URL, {
        path: '/clients/socketio/hubs/Hub',
      }),
    []
  )

  // Register the event listeners
  useEffect(() => {
    socket.on('hello', (msg) => {
      console.log('Received from server:', msg)
    })
    return () => {
      socket.disconnect()
    }
  }, [socket])

  // Example function to emit a message
  const sendHowdy = (message: string = 'stranger') => {
    socket.emit('howdy', message)
  }

  return (
    <SocketContext.Provider value={{ socket, sendHowdy }}>
      {children}
    </SocketContext.Provider>
  )
}

// Custom hook for accessing socket context
export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
