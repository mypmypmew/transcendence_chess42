import { NavLink } from 'react-router-dom'

import {
  Icon,
} from './ui.jsx'

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { to: '/game-lobby', label: 'Game', icon: 'chess-rook' },
  { action: 'leaderboard', label: 'Leaderboard', icon: 'trophy' },
  { to: '/friends', label: 'Friends', icon: 'users' },
  { to: '/profile', label: 'Profile', icon: 'user-circle' },
  { to: '/chat', label: 'Chat', icon: 'messages' },
]

function Sidebar({ onOpenLeaderboard }) {
  return (
    <aside className="cm-sidebar" aria-label="Main navigation">
      <nav className="cm-nav">
        {navigationItems.map((item) => {
          if (item.action === 'leaderboard') {
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
      </nav>

    </aside>
  )
}

export default Sidebar
