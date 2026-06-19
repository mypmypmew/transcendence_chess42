import { NavLink } from 'react-router-dom'

import ThemeToggle from './ThemeToggle.jsx'

const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'ti ti-layout-dashboard' },
  { to: '/game', label: 'Game', icon: 'ti ti-chess' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'ti ti-trophy' },
  { to: '/profile', label: 'Profile', icon: 'ti ti-user-circle' },
]

function AppLayout({ eyebrow, title, actions, children }) {
  return (
    <div className="cm-shell fade-in">
      <div className="cm-backdrop" aria-hidden="true" />
      <div className="cm-app-frame">
        <header className="cm-header">
          <NavLink className="cm-brand" to="/dashboard" aria-label="ChessMate dashboard">
            <i className="ti ti-crown" aria-hidden="true" />
            <span>ChessMate</span>
          </NavLink>

          <div className="cm-header-copy">
            <p className="cm-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
          </div>

          <div className="cm-header-actions">
            {actions}
            <ThemeToggle />
          </div>
        </header>

        <div className="cm-main-grid">
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

            <div className="cm-sidebar-card">
              <i className="ti ti-sparkles" aria-hidden="true" />
              <p className="label">Theme ready</p>
              <p>Light mode infrastructure is enabled.</p>
            </div>
          </aside>

          <main className="cm-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
