import { useEffect, useState } from 'react'

const resultConfig = {
  win: { label: 'Win', badge: 'badge badge-win' },
  loss: { label: 'Loss', badge: 'badge badge-loss' },
  draw: { label: 'Draw', badge: 'badge badge-draw' },
}

// Mocked data — no backend connection yet.
// Each match: opponent, result relative to the profile owner, duration and date.
const mockMatches = [
  { id: 1, opponent: 'Serhii', result: 'win', duration: '18:42', date: '2026-07-11T14:20:00' },
  { id: 2, opponent: 'Taulant', result: 'loss', duration: '32:05', date: '2026-07-10T09:05:00' },
  { id: 3, opponent: 'Tatiana', result: 'draw', duration: '45:12', date: '2026-07-08T19:40:00' },
  { id: 4, opponent: 'Alima', result: 'win', duration: '11:57', date: '2026-07-05T21:15:00' },
]

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function sortByDateDesc(matches) {
  return [...matches].sort((a, b) => new Date(b.date) - new Date(a.date))
}

/**
 * MatchHistory — UI-only component (personal account sub-section).
 * Props:
 *  - matches: array of { id, opponent, result: 'win'|'loss'|'draw', duration, date } — defaults to mocked data
 *  - isLoading: boolean — shows a loading placeholder instead of the list
 *
 * Rows are not clickable in this version (no game details view yet).
 */
function MatchHistory({ matches = mockMatches, isLoading = false }) {
  const [sortedMatches, setSortedMatches] = useState([])

  useEffect(() => {
    setSortedMatches(sortByDateDesc(matches))
  }, [matches])

  return (
    <section className="cm-panel" aria-labelledby="history-title">
      <div className="cm-panel-header">
        <div>
          <p className="label">Games</p>
          <h2 className="cm-section-title" id="history-title">Match history</h2>
        </div>
        <span className="badge badge-accent">Preview</span>
      </div>

      <div className="cm-panel-body cm-list">
        {isLoading ? (
          <p className="cm-muted">Loading matches…</p>
        ) : sortedMatches.length === 0 ? (
          <p className="cm-muted">No matches yet</p>
        ) : (
          sortedMatches.map((match) => {
            const config = resultConfig[match.result]

            return (
              <article className="cm-list-row" key={match.id}>
                <i className="ti ti-chess text-accent" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-primary truncate">vs {match.opponent}</p>
                  <p className="cm-muted">{match.duration} · {formatDate(match.date)}</p>
                </div>
                <span className={config.badge}>{config.label}</span>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}

export default MatchHistory
