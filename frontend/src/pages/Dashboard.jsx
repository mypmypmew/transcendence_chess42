import { Link } from 'react-router-dom'

import Avatar from '../components/Avatar.jsx'
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
      <Link className="btn btn-ghost" to="/game">
        <i className="ti ti-target-arrow" aria-hidden="true" />
        Think
      </Link>
      <Link className="btn btn-ghost" to="/leaderboard">
        <i className="ti ti-trophy" aria-hidden="true" />
        Compete
      </Link>
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
              <div className="flex items-end gap-2" aria-hidden="true" style={{ height: 92, marginTop: 'var(--space-3)' }}>
                {[34, 42, 36, 52, 58, 68, 76, 88].map((height, index) => (
                  <span
                    key={index}
                    style={{
                      height: `${height}%`,
                      flex: 1,
                      borderRadius: 'var(--radius-sm)',
                      background: 'linear-gradient(180deg, var(--accent-hover), rgba(212, 160, 55, 0.18))',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="cm-panel">
          <div className="cm-panel-header">
            <h2 className="cm-section-title">Training</h2>
            <span className="cm-muted">Today</span>
          </div>
          <div className="cm-panel-body cm-action-grid">
            <Link className="cm-action-card" to="/game">
              <i className="ti ti-chess-rook" aria-hidden="true" />
              <h3>Quick Play</h3>
              <p className="cm-muted">Instant match with default settings</p>
            </Link>
            <Link className="cm-action-card" to="/dashboard">
              <i className="ti ti-puzzle" aria-hidden="true" />
              <h3>Puzzles - Experimental</h3>
              <p className="cm-muted">Sharpen tactics</p>
            </Link>
            <Link className="cm-action-card" to="/dashboard">
              <i className="ti ti-book" aria-hidden="true" />
              <h3>Lessons - Experimental</h3>
              <p className="cm-muted">Learn positions</p>
            </Link>
            <Link className="cm-action-card" to="/dashboard">
              <i className="ti ti-award" aria-hidden="true" />
              <h3>Tournaments - Experimental</h3>
              <p className="cm-muted">Join and compete</p>
            </Link>
          </div>
        </section>

        <section className="cm-panel">
          <div className="cm-panel-header">
            <h2 className="cm-section-title">Recent games</h2>
          </div>
          <div className="cm-panel-body cm-list">
            {recentGames.map((game) => (
              <div className="cm-list-row" key={game.opponent}>
                <Avatar avatar={null} name={game.opponent} className="avatar avatar-md" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-primary truncate">vs {game.opponent}</p>
                  <p className="cm-muted">{game.time}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${game.badge}`}>{game.result}</span>
                  <p className="cm-muted">{game.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

export default Dashboard