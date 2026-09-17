import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import LeaderboardModal from './LeaderboardModal.jsx'
import LegalFooter from './LegalFooter.jsx'
import { Icon } from './ui.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function AppLayout({ eyebrow, title, actions, children, showLegalFooter = true }) {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  async function handleLogout() {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)
    setLogoutError('')

    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : 'Logout failed'
      )
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Share the same leaderboard opener between navigation and page content.
  function openLeaderboard() {
    setIsLeaderboardOpen(true)
  }
  
  return (
    <div className="cm-shell fade-in">
      <div className="cm-backdrop" aria-hidden="true" />
      <div className="cm-app-frame">
        <header className="cm-header">
          <NavLink className="cm-brand" to="/dashboard" aria-label="ChessMate dashboard">
            <Icon name="crown" />
            <span>ChessMate</span>
          </NavLink>
          <div className="cm-header-copy">
            <p className="cm-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
          </div>
          <div className="cm-header-actions">
            {actions}
            <span className="flex-1" aria-hidden="true" />
            <ThemeToggle />
          </div>
        </header>
        <div className="cm-main-grid">
          <Sidebar
            onOpenLeaderboard={openLeaderboard}
          />
          <main className="cm-content">
            {typeof children === 'function'
              ? children({ openLeaderboard, handleLogout, isLoggingOut, logoutError })
              : children}
          </main>
        </div>
        {showLegalFooter && <LegalFooter />}
      </div>
      {isLeaderboardOpen && <LeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />}
    </div>
  )
}
export default AppLayout
