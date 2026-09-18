import { useEffect, useState } from 'react'

import { getLeaderboard } from '../api/userApi'
import { toModalPlayer } from '../utils/userProfile.js'
import { useOpenConversation } from '../hooks/useOpenConversation.js'
import Avatar from './Avatar.jsx'
import Modal from './Modal.jsx'
import UserProfileModal from './UserProfileModal.jsx'
import {
  Button,
  EmptyState,
  IconButton,
  PanelBody,
  Tab,
  Tabs,
  Table,
} from './ui.jsx'

function LeaderboardModal({ onClose }) {
  const [players, setPlayers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const { startConversation } = useOpenConversation()

  async function handleOpenMessage(player) {
    await startConversation(player, {
      onSuccess: () => {
        setSelectedPlayer(null)
        onClose()
      },
    })
  }

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
    <>
      <Modal
        actions={(
          <div className="cm-modal__header-actions">
            <Tabs>
              <Tab active>Global</Tab>
            </Tabs>
            <IconButton aria-label="Close leaderboard modal" icon="x" onClick={onClose} />
          </div>
        )}
        description="Top 10 players sorted by rating"
        onClose={onClose}
        title="Leaderboard"
        titleId="leaderboard-title"
      >
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

            {!isLoading && !error && players.length > 0 && (
              <Table>
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
                          <Avatar avatar={player.avatar} name={player.username} className="avatar avatar-md" />
                          <Button
                            type="button"
                            variant="link"
                            aria-label={`Open profile of ${player.username}`}
                            onClick={() => setSelectedPlayer(
                              toModalPlayer(player, { isFriend: false }),
                            )}
                          >
                            {player.username}
                          </Button>
                        </div>
                      </td>
                      <td>{player.games}</td>
                      <td>{player.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </PanelBody>
      </Modal>

      {selectedPlayer && (
        <UserProfileModal
          key={selectedPlayer.id}
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onMessage={handleOpenMessage}
        />
      )}
    </>
  )
}

export default LeaderboardModal
