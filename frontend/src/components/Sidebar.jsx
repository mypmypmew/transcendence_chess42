import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'ti ti-layout-dashboard' },
  { to: '/game', label: 'Game', icon: 'ti ti-chess-rook' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'ti ti-trophy' },
  { to: '/friends', label: 'Friends', icon: 'ti ti-users' },
  { to: '/profile', label: 'Profile', icon: 'ti ti-user-circle' },
  { to: '/chat', label: 'Chat', icon: 'ti ti-messages' },
  { action: 'logout', label: 'Logout', icon: 'ti ti-logout' },
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
                <i className={item.icon} aria-hidden="true" />
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
                <i className={item.icon} aria-hidden="true" />
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
              <i className={item.icon} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
        {logoutError && (
          <div className="alert alert-error visible" role="alert">
            <i className="ti ti-alert-circle" aria-hidden="true" />
            <span>{logoutError}</span>
          </div>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar
