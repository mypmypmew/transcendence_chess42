import { useEffect, useState } from 'react'

import { getLeaderboard } from '../api/userApi'
import Avatar from './Avatar.jsx'
import {
  EmptyState,
  IconButton,
  Panel,
  PanelBody,
  PanelHeader,
} from './ui.jsx'
import './Modal.css'

function LeaderboardModal({ onClose }) {
  const [players, setPlayers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load current rankings and ignore responses after the modal closes.
  useEffect(() => {
    let cancelled = false
    async function loadLeaderboard() {
      try {
        const data = await getLeaderboard()

        if (!Array.isArray(data?.players)) {
          throw new Error('Invalid leaderboard response')
        }

        if (!cancelled) {
          setPlayers(data.players)
          setError(null)
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadLeaderboard()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="cm-modal" role="dialog" aria-modal="true" aria-labelledby="leaderboard-title">
      <button className="cm-modal__backdrop" type="button" aria-label="Close leaderboard modal" onClick={onClose} />
      <Panel as="div" className="cm-modal__content">
        <PanelHeader
          action={(
            <div className="cm-modal__header-actions">
              <span className="cm-tab active flex items-center justify-center">Global</span>
              <IconButton aria-label="Close leaderboard modal" icon="x" onClick={onClose} />
            </div>
          )}
          title="Leaderboard"
          titleId="leaderboard-title"
        >
          <p className="cm-muted">Top 10 players sorted by rating</p>
        </PanelHeader>

        {/* Show loading, failure, and empty results separately. */}
        <PanelBody>
          {isLoading && (
            <EmptyState icon="trophy" title="Loading leaderboard..." />
          )}

          {!isLoading && error && (
            <EmptyState icon="trophy" title="Could not load leaderboard." subtitle="Please close the leaderboard and open it again to retry." />
          )}

          {!isLoading && !error && players.length === 0 && (
            <EmptyState icon="trophy" title="No players yet." />
          )}

          {/* Preserve the server ranking and display only real player data. */}
          {!isLoading && !error && players.length > 0 && (
            <table className="cm-table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Player</th>
                  <th scope="col">Games</th>
                  <th scope="col">Rating</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={player.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar avatar={null} name={player.username} className="avatar avatar-md" />
                        <span className="stat-num text-primary">
                          {player.username}
                        </span>
                      </div>
                    </td>
                    <td>{player.games}</td>
                    <td>{player.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </PanelBody>
      </Panel>
    </div>
  )
}

export default LeaderboardModal
