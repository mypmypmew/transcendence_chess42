import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SocketProvider } from './context/SocketContext.jsx'

import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </ThemeProvider>
  </StrictMode>,
)
