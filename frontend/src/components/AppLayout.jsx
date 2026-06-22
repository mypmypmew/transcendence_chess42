import { NavLink } from 'react-router-dom'

import Sidebar from './Sidebar.jsx'
import ThemeToggle from './ThemeToggle.jsx'

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
          <Sidebar />

          <main className="cm-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppLayout