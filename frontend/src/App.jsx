import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import GameLobby from './pages/GameLobby'
import Game from './pages/Game'
import Analysis from './pages/Analysis'
import Profile from './pages/Profile'
import Friends from './pages/Friends'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsOfService from './pages/legal/TermsOfService'

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
        <Route path="/game-lobby" element={<ProtectedRoute><GameLobby /></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
        <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        {/* <Route path="/leaderboard" element={<Leaderboard />} /> */}
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
