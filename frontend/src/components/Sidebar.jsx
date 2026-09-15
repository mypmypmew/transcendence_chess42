import { NavLink } from 'react-router-dom'

import {
  Alert,
  Icon,
} from './ui.jsx'

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  // Open matchmaking before navigating the player to a server-created game.
  { to: '/game-lobby', label: 'Game', icon: 'chess-rook' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'trophy' },
  { to: '/friends', label: 'Friends', icon: 'users' },
  { to: '/profile', label: 'Profile', icon: 'user-circle' },
  { to: '/chat', label: 'Chat', icon: 'messages' },
  { action: 'logout', label: 'Logout', icon: 'logout' },
]

function Sidebar({ isLoggingOut = false, logoutError = '', onLogout, onOpenLeaderboard }) {
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
                onClick={onLogout}
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
