import { Link } from 'react-router-dom'

import Avatar from '../components/Avatar.jsx'
import AppLayout from '../components/AppLayout'
import {
  ActionCard,
  Badge,
  Button,
  Icon,
  ListRow,
  Panel,
  PanelBody,
  PanelHeader,
  StatCell,
} from '../components/ui.jsx'
import './App.css'

const recentGames = [
  { opponent: 'Artemis', result: 'Win', rating: '+12', time: '2 hours ago', variant: 'win' },
  { opponent: 'BishopBrain', result: 'Draw', rating: '0', time: 'Yesterday', variant: 'draw' },
  { opponent: 'CastleGuard', result: 'Loss', rating: '-8', time: '2 days ago', variant: 'loss' },
]

function Dashboard() {
  const actions = (
    <>
      <Button as={Link} icon="target-arrow" to="/game-lobby" variant="ghost">
        Think
      </Button>
      <Button as={Link} icon="trophy" to="/leaderboard" variant="ghost">
        Compete
      </Button>
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
            <Button as={Link} to="/game-lobby">Play now</Button>
            <Button as={Link} to="/leaderboard" variant="ghost">View rankings</Button>
          </div>
        </section>

        <Panel aria-labelledby="rating-title">
          <PanelHeader
            action={<Badge>Rapid</Badge>}
            title="Rating"
            titleId="rating-title"
          />
          <PanelBody>
            <div className="cm-stat-grid">
              <StatCell label="Rating" value="1768" />
              <StatCell label="Games" value="312" />
              <StatCell label="Win rate" value="61%" />
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
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader action={<span className="cm-muted">Today</span>} title="Training" />
          <PanelBody className="cm-action-grid">
            <ActionCard as={Link} to="/game-lobby">
              <Icon name="chess-rook" />
              <h3>Quick Play</h3>
              <p className="cm-muted">Instant match with default settings</p>
            </ActionCard>
            <ActionCard as={Link} to="/dashboard">
              <Icon name="puzzle" />
              <h3>Puzzles - Experimental</h3>
              <p className="cm-muted">Sharpen tactics</p>
            </ActionCard>
            <ActionCard as={Link} to="/dashboard">
              <Icon name="book" />
              <h3>Lessons - Experimental</h3>
              <p className="cm-muted">Learn positions</p>
            </ActionCard>
            <ActionCard as={Link} to="/dashboard">
              <Icon name="award" />
              <h3>Tournaments - Experimental</h3>
              <p className="cm-muted">Join and compete</p>
            </ActionCard>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Recent games" />
          <PanelBody className="cm-list">
            {recentGames.map((game) => (
              <ListRow key={game.opponent}>
                <Avatar avatar={null} name={game.opponent} className="avatar avatar-md" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-primary truncate">vs {game.opponent}</p>
                  <p className="cm-muted">{game.time}</p>
                </div>
                <div className="text-right">
                  <Badge variant={game.variant}>{game.result}</Badge>
                  <p className="cm-muted">{game.rating}</p>
                </div>
              </ListRow>
            ))}
          </PanelBody>
        </Panel>
      </div>
    </AppLayout>
  )
}

export default Dashboard
