import { Link } from 'react-router-dom'

import AppLayout from '../components/AppLayout'
import './App.css'

const recentGames = [
  { opponent: 'Artemis', result: 'Win', rating: '+12', time: '2 hours ago', badge: 'badge-win' },
  { opponent: 'BishopBrain', result: 'Draw', rating: '0', time: 'Yesterday', badge: 'badge-draw' },
  { opponent: 'CastleGuard', result: 'Loss', rating: '-8', time: '2 days ago', badge: 'badge-loss' },
]

function Dashboard() {
  const actions = (
    <>
      
    </>
  )

  return (
    <AppLayout eyebrow="Play. Learn. Improve." title="Your chess command center" actions={actions}>
      <div className="cm-page-grid two">
        <section className="cm-hero-card" aria-labelledby="dashboard-hero-title">
          <div>
            <p className="cm-eyebrow">Welcome back</p>
            <h2 className="cm-hero-title" id="dashboard-hero-title">Ready for your next move?</h2>
            <p className="auth-visual-text">
              Practice tactics, start a quick match, or review your latest games in one calm, focused space.
            </p>
          </div>
          <div className="flex gap-3">
            <Link className="btn btn-primary" to="/game">Play now</Link>
            <Link className="btn btn-ghost" to="/leaderboard">View rankings</Link>
          </div>
        </section>

        <section className="cm-panel" aria-labelledby="rating-title">
          <div className="cm-panel-header">
            <h2 className="cm-section-title" id="rating-title">Rating</h2>
            <span className="badge badge-accent">Rapid</span>
          </div>
          <div className="cm-panel-body">
            <div className="cm-stat-grid">
              <div className="stat-cell">
                <div className="stat-num">1768</div>
                <div className="stat-lbl">Rating</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">312</div>
                <div className="stat-lbl">Games</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">61%</div>
                <div className="stat-lbl">Win rate</div>
              </div>
            </div>
            <div className="surface" style={{ marginTop: 'var(--space-5)', padding: 'var(--space-4)' }}>
              <p className="label">Weekly progress</p>
              Here will be a chart showing your rating progress over the past week
            </div>
          </div>
        </section>

        <section className="cm-panel">
          
        </section>

        <section className="cm-panel">
          <div className="cm-panel-header">
            <h2 className="cm-section-title">Recent games</h2>
        
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

export default Dashboard
