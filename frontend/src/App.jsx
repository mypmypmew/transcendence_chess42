import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GameEntry from './pages/GameEntry'
import Game from './pages/Game'
import Profile from './pages/Profile'
import Friends from './pages/Friends'
import Chat from './pages/Chat'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsOfService from './pages/legal/TermsOfService'
import './pages/App.css'

function AuthLoadingScreen() {
  return (
    <main className="auth-scene fade-in">
      <p>Loading…</p>
    </main>
  )
}

function HomeRoute() {
  const { isAuthLoading, isAuthenticated } = useAuth()

  if (isAuthLoading) {
    return <AuthLoadingScreen />
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

function ProtectedRoute({ children }) {
  const { isAuthLoading, isAuthenticated } = useAuth()

  if (isAuthLoading) {
    return <AuthLoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthLoading, isAuthenticated } = useAuth()

  if (isAuthLoading) {
    return <AuthLoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />

        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/game-lobby" element={<ProtectedRoute><GameEntry /></ProtectedRoute>} />
        {/* Resolve an active game before opening matchmaking. */}
        <Route path="/game" element={<ProtectedRoute><GameEntry /></ProtectedRoute>} />
        {/* Keep the server-generated game ID in the URL so reconnect can restore the correct game. */}
        <Route path="/game/:gameId" element={<ProtectedRoute><Game /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
