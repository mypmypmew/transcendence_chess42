import { useId, useState } from 'react'
import {
  Badge,
  Button,
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
  pending: { label: 'Pending', variant: 'accent' },
  cancelled: { label: 'Cancelled', variant: 'accent' },
  unknown: { label: 'Unknown', variant: 'accent' },
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
  if (game.status === 'CANCELLED') {
    return 'cancelled'
  }

  if (game.status === 'IN_PROGRESS') {
    return 'pending'
  }

  if (game.status !== 'COMPLETED') {
    return 'unknown'
  }

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
 * MatchHistory — shared game history for Profile and Dashboard.
 * Props:
 *  - games: backend game list from GET /api/games
 *  - currentUserId: authenticated user id
 *  - error: request error message
 *  - isLoading: shows a loading placeholder instead of the list
 *  - onRetry: optional callback to reload history after an error
 *  - pageSize: optional number of matches per page; null shows all supplied matches
 *  - title: panel heading; defaults to the existing Profile heading
 *
 * Rows are not clickable in this version (no game details view yet).
 */
function MatchHistory({
  className = '',
  games = [],
  currentUserId,
  error = null,
  isLoading = false,
  onRetry,
  pageSize = null,
  title = 'Match history'
}) {
  const titleId = useId()
  const [page, setPage] = useState(1)
  const isPaginated = Number.isInteger(pageSize) && pageSize > 0
  const pageCount = isPaginated
    ? Math.max(1, Math.ceil(games.length / pageSize))
    : 1
  const currentPage = Math.min(page, pageCount)

  const displayedGames = isPaginated
    ? [...games]
      .sort((a, b) => (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        || b.id - a.id
      ))
      .slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : games

  return (
    <Panel aria-labelledby={titleId} className={className}>
      <PanelHeader
        action={<Badge>{games.length}</Badge>}
        eyebrow="Games"
        title={title}
        titleId={titleId}
      />

      <PanelBody className="cm-list">
        {isLoading ? (
          <p className="cm-muted">Loading matches…</p>
        ) : error ? (
          <div className="flex flex-col gap-3" role="alert">
            <p className="cm-muted">{error}</p>
            {onRetry && (
              <Button type="button" variant="ghost" onClick={onRetry}>
                Try again
              </Button>
            )}
          </div>
        ) : games.length === 0 ? (
          <EmptyState title="No matches yet" />
        ) : (
          displayedGames.map((game) => {
            const opponent = getOpponent(game, currentUserId)
            const result = getGameResult(game, currentUserId)
            const config = resultConfig[result]

            return (
              <ListRow as="article" key={game.id}>
                <Icon className="text-accent" name="chess" />
                <div className="min-w-0">
                  {/* Separate the opponent heading from muted details and keep the prefix smaller. */}
                  <p className="stat-num text-primary truncate">
                    <small>vs </small>
                    <span>{opponent.username}</span>
                  </p>
                  {/* Keep opponent rating separate from the game status and date. */}
                  <p className="cm-muted">
                    Rating {opponent.rating}
                  </p>
                  <p className="cm-muted">
                    {game.status} · {formatDate(game.endedAt ?? game.createdAt)}
                  </p>
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
              </ListRow>
            )
          })
        )}
      </PanelBody>

      {isPaginated && pageCount > 1 && !isLoading && !error && (
        <PanelBody>
          <nav
            className="flex items-center justify-between gap-2"
            aria-label="Match history pages"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="cm-muted" aria-live="polite">
              {currentPage} / {pageCount}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </Button>
          </nav>
        </PanelBody>
      )}
    </Panel>
  )
}

export default MatchHistory
