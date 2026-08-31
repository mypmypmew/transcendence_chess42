import {
  Badge,
  EmptyState,
  Icon,
  ListRow,
  Panel,
  PanelBody,
  PanelHeader,
} from './ui.jsx'

const resultConfig = {
  win: { label: 'Win', variant: 'win' },
  loss: { label: 'Loss', variant: 'loss' },
  draw: { label: 'Draw', variant: 'draw' },
  unknown: { label: 'Pending', variant: 'accent' },
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
    <Panel aria-labelledby="history-title">
      <PanelHeader
        action={<Badge>{games.length}</Badge>}
        eyebrow="Games"
        title="Match history"
        titleId="history-title"
      />

      <PanelBody className="cm-list">
        {isLoading ? (
          <p className="cm-muted">Loading matches…</p>
        ) : error ? (
          <p className="cm-muted">{error}</p>
        ) : games.length === 0 ? (
          <EmptyState title="No matches yet" />
        ) : (
          games.map((game) => {
            const opponent = getOpponent(game, currentUserId)
            const result = getGameResult(game, currentUserId)
            const config = resultConfig[result]

            return (
              <ListRow as="article" key={game.id}>
                <Icon className="text-accent" name="chess" />
                <div className="min-w-0">
                  <p className="text-primary truncate">vs {opponent.username}</p>
                  <p className="cm-muted">
                    Rating {opponent.rating} · {game.status} · {formatDate(game.createdAt)}
                  </p>
                  {game.endedAt && (
                    <p className="cm-muted">Ended {formatDate(game.endedAt)}</p>
                  )}
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
              </ListRow>
            )
          })
        )}
      </PanelBody>
    </Panel>
  )
}

export default MatchHistory
