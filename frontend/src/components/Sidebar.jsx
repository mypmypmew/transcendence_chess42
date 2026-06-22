import { NavLink } from 'react-router-dom'

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'ti ti-layout-dashboard' },
  { to: '/game', label: 'Game', icon: 'ti ti-chess' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'ti ti-trophy' },
  { to: '/profile', label: 'Profile', icon: 'ti ti-user-circle' },
  { to: '/chat', label: 'Chat', icon: 'ti ti-messages' },
  { to: '/logout', label: 'Logout', icon: 'ti ti-logout' },
]

function Sidebar() {
  return (
    <aside className="cm-sidebar" aria-label="Main navigation">
      <nav className="cm-nav">
        {navigationItems.map((item) => (
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
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar