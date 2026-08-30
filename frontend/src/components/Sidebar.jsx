import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { Alert, Icon } from './ui.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { to: '/game', label: 'Game', icon: 'chess-rook' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'trophy' },
  { to: '/friends', label: 'Friends', icon: 'users' },
  { to: '/profile', label: 'Profile', icon: 'user-circle' },
  { to: '/chat', label: 'Chat', icon: 'messages' },
  { action: 'logout', label: 'Logout', icon: 'logout' },
]

function Sidebar({ onOpenLeaderboard }) {
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
      navigate('/login')
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Logout failed')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <aside className="cm-sidebar" aria-label="Main navigation">
      <nav className="cm-nav">
        {navigationItems.map((item) => {
          if (item.label === 'Leaderboard') {
            return (
              <button
                className="cm-nav-link"
                key={item.label}
                type="button"
                onClick={onOpenLeaderboard}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </button>
            )
          }

          if (item.action === 'logout') {
            return (
              <button
                className="cm-nav-link"
                key={item.label}
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
              >
                <Icon name={item.icon} />
                <span>{isLoggingOut ? 'Logging out…' : item.label}</span>
              </button>
            )
          }

          return (
            <NavLink
              className={({ isActive }) => {
                let className = 'cm-nav-link'
                if (isActive) {
                  className += ' active'
                }
                return className
              }}
              key={item.to}
              to={item.to}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
        {logoutError && (
          <Alert>{logoutError}</Alert>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar
