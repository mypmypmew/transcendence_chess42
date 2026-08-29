const resultConfig = {
  win: { label: 'Win', badge: 'badge badge-win' },
  loss: { label: 'Loss', badge: 'badge badge-loss' },
  draw: { label: 'Draw', badge: 'badge badge-draw' },
  unknown: { label: 'Pending', badge: 'badge badge-accent' },
}

function formatDate(isoDate) {
  if (!isoDate) {
    return 'In progress'
  }

  return new Date(isoDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getOpponent(game, currentUserId) {
  return game.white.id === currentUserId ? game.black : game.white
}

function getGameResult(game, currentUserId) {
  if (!game.result) {
    return 'unknown'
  }

  if (game.result === 'DRAW') {
    return 'draw'
  }

  if (!game.winnerId) {
    return 'unknown'
  }

  return game.winnerId === currentUserId ? 'win' : 'loss'
}

/**
 * MatchHistory — personal account game history.
 * Props:
 *  - games: backend game list from GET /api/games
 *  - currentUserId: authenticated user id
 *  - error: request error message
 *  - isLoading: shows a loading placeholder instead of the list
 *
 * Rows are not clickable in this version (no game details view yet).
 */
function MatchHistory({
  games = [],
  currentUserId,
  error = null,
  isLoading = false,
}) {
  return (
    <section className="cm-panel" aria-labelledby="history-title">
      <div className="cm-panel-header">
        <div>
          <p className="label">Games</p>
          <h2 className="cm-section-title" id="history-title">Match history</h2>
        </div>
        <span className="badge badge-accent">{games.length}</span>
      </div>

      <div className="cm-panel-body cm-list">
        {isLoading ? (
          <p className="cm-muted">Loading matches…</p>
        ) : error ? (
          <p className="cm-muted">{error}</p>
        ) : games.length === 0 ? (
          <p className="cm-muted">No matches yet</p>
        ) : (
          games.map((game) => {
            const opponent = getOpponent(game, currentUserId)
            const result = getGameResult(game, currentUserId)
            const config = resultConfig[result]

            return (
              <article className="cm-list-row" key={game.id}>
                <i className="ti ti-chess text-accent" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-primary truncate">vs {opponent.username}</p>
                  <p className="cm-muted">
                    Rating {opponent.rating} · {game.status} · {formatDate(game.createdAt)}
                  </p>
                  {game.endedAt && (
                    <p className="cm-muted">Ended {formatDate(game.endedAt)}</p>
                  )}
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
