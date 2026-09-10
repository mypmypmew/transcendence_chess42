import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import MatchHistory from '../components/MatchHistory.jsx'
import AppLayout from '../components/AppLayout'
import {
  ActionCard,
  Alert,
  Button,
  Icon,
  Panel,
  PanelBody,
  PanelHeader,
  StatCell,
} from '../components/ui.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getGames } from '../api/gameApi.js'
import { getGameStatistics, getWeeklyActivity } from '../utils/gameStatistics.js'
import './App.css'

function Dashboard() {
  // Use the signed-in account as the source of the displayed rating.
  const { user } = useAuth()
  const userId = user?.id
  const [history, setHistory] = useState(null)

  // Load history for the current account and ignore outdated responses.
  useEffect(() => {
    if (!userId) {
      return
    }

    let isActive = true

    async function loadGames() {
      try {
        const data = await getGames()

        // An invalid response must not appear as an empty game history.
        if (!Array.isArray(data?.games)) {
          throw new Error('Unable to load game statistics.')
        }

        if (isActive) {
          setHistory({
            userId,
            games: data.games,
            error: null,
          })
        }
      } catch (error) {
        if (isActive) {
          setHistory({
            userId,
            games: [],
            error: error.message || 'Unable to load game statistics.',
          })
        }
      }
    }

    loadGames()

    return () => {
      isActive = false
    }
  }, [userId])

  // Never display a previous account's history while loading a new one.
  const currentHistory = history?.userId === userId ? history : null
  const isHistoryLoading = Boolean(userId) && currentHistory === null
  const historyError = currentHistory?.error ?? null

  // Calculate statistics only after a successful response.
  const statistics = currentHistory && !historyError
    ? getGameStatistics(currentHistory.games, userId)
    : null

  // Use the full history so weekly activity is not limited to five recent games.
  const weeklyActivity = currentHistory && !historyError
    ? getWeeklyActivity(currentHistory.games, userId)
    : null

  // Keep an empty week at zero and avoid division by zero when scaling bars.
  const maxDailyGames = Math.max(
    1,
    ...(weeklyActivity?.map((day) => day.count) ?? []),
  )

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
            title="Rating"
            titleId="rating-title"
          />
          <PanelBody>
            {/* Keep unavailable statistics distinct from a successfully loaded empty history. */}
            <div className="cm-stat-grid">
              <StatCell label="Rating" value={user?.rating ?? '-'} />
              <StatCell label="Games" value={statistics?.totalGames ?? '-'} />
              <StatCell
                label="Win rate"
                value={statistics && statistics.winRate !== null
                  ? `${statistics.winRate}%`
                  : '-'}
              />
            </div>

            {isHistoryLoading && (
              <p className="cm-muted" role="status">
                Loading game statistics...
              </p>
            )}

            {historyError && (
              <Alert>{historyError}</Alert>
            )}

            {/* Render real daily counts only after history has loaded successfully. */}
            {weeklyActivity && (
              <div className="surface" style={{ marginTop: 'var(--space-5)', padding: 'var(--space-4)' }}>
                <p className="label">Completed games over 7 days</p>
                <div className="flex gap-2" style={{ marginTop: 'var(--space-3)' }}>
                  {weeklyActivity.map((day) => (
                    <div className="flex-1 min-w-0 text-center" key={day.date}>
                      {/* Keep each count above its bar and reserve space for the tallest label. */}
                      <div className="flex flex-col" style={{ height: 'calc(92px + 1.5em)', justifyContent: 'flex-end' }}>
                        <p className="text-primary">{day.count}</p>

                        {/* Only the decorative bar is hidden from assistive technologies. */}
                        <div
                          aria-hidden="true"
                          style={{
                            height: `${(day.count / maxDailyGames) * 92}px`,
                            flexShrink: 0,
                            borderRadius: 'var(--radius-sm)',
                            background: 'linear-gradient(180deg, var(--accent-hover), rgba(212, 160, 55, 0.18))',
                          }}
                        />
                      </div>

                      <p className="cm-muted">{day.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

        {/* Reuse the existing history panel for the five latest completed games. */}
        <MatchHistory
          title="Recent games"
          games={statistics?.recentGames ?? []}
          currentUserId={userId}
          isLoading={isHistoryLoading}
          error={historyError}
        />
      </div>
    </AppLayout>
  )
}

export default Dashboard
