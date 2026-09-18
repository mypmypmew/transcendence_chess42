import { useEffect, useState } from 'react'

import Avatar from './Avatar.jsx'
import Modal from './Modal.jsx'
import MatchHistory from './MatchHistory.jsx'
import { getPlayerGames } from '../api/userApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import {
  Alert,
  Button,
  IconButton,
  PanelBody,
} from './ui.jsx'

function UserProfileModal({
  player,
  onClose,
  onAddFriend,
  onMessage,
  onRemoveFriend,
}) {
  const { user } = useAuth()
  const [pendingAction, setPendingAction] = useState(null)
  const [actionError, setActionError] = useState(null)
  const hasBackendUserId = Number.isInteger(player.id) && player.id > 0
  const isCurrentUser = hasBackendUserId && player.id === user?.id
  const hasPendingFriendRequest = player.hasPendingFriendRequest === true
  const friendAction = player.isFriend ? onRemoveFriend : onAddFriend
  const friendActionLabel = hasPendingFriendRequest
    ? player.friendActionLabel || 'Request sent'
    : player.isFriend ? 'Remove friend' : 'Add friend'
  const isFriendActionPending = pendingAction === 'friend'
  const isMessageActionPending = pendingAction === 'message'
  const isMessageActionDisabled = (
    !hasBackendUserId
    || isCurrentUser
    || !onMessage
    || pendingAction !== null
  )
  const isFriendActionDisabled = (
    !hasBackendUserId
    || hasPendingFriendRequest
    || !friendAction
    || pendingAction !== null
  )
  const [historyState, setHistoryState] = useState(null)
  const [historyAttempt, setHistoryAttempt] = useState(0)
  const playerId = player.id

  // Display only the response belonging to this player and request attempt.
  const currentHistory = (
    historyState?.playerId === playerId
    && historyState?.attempt === historyAttempt
  ) ? historyState : null

  useEffect(() => {
    if (!hasBackendUserId) {
      return undefined
    }

    const controller = new AbortController()

    async function loadHistory() {
      try {
        const data = await getPlayerGames(playerId, {
          signal: controller.signal,
        })

        if (!Array.isArray(data?.games)) {
          throw new Error('Invalid match history response')
        }

        if (!controller.signal.aborted) {
          setHistoryState({
            playerId,
            attempt: historyAttempt,
            games: data.games,
            error: null,
          })
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setHistoryState({
            playerId,
            attempt: historyAttempt,
            games: [],
            error: error.message || 'Could not load match history',
          })
        }
      }
    }

    loadHistory()

    return () => controller.abort()
  }, [playerId, hasBackendUserId, historyAttempt])

  async function runAction(actionName, action) {
    if (!action || !hasBackendUserId) {
      return
    }

    setPendingAction(actionName)
    setActionError(null)

    try {
      await action(player)
    } catch (error) {
      setActionError(error.message)
    } finally {
      setPendingAction(null)
    }
  }

  const recentGames = [...(currentHistory?.games ?? [])]
    .sort((a, b) => (
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      || b.id - a.id
    ))
    .slice(0, 3)

  return (
    <Modal
      className="cm-modal--nested"
      header={(
        <div className="cm-panel-header">
          <div className="flex items-center gap-3">
            <Avatar avatar={player.avatar} name={player.nickname} className="avatar avatar-md" aria-hidden="true" />
            <div>
              <h2 className="cm-section-title" id="profile-modal-title">{player.nickname}</h2>
              <p className="cm-muted">Rating {player.rating}</p>
            </div>
          </div>
          <IconButton aria-label="Close profile modal" icon="x" onClick={onClose} />
        </div>
      )}
      onClose={onClose}
      size="sm"
      titleId="profile-modal-title"
    >
        <PanelBody>
          {actionError && (
            <Alert>{actionError}</Alert>
          )}

          <MatchHistory
            games={recentGames}
            title="Last 3 matches"
            currentUserId={playerId}
            isLoading={hasBackendUserId && currentHistory === null}
            error={
              hasBackendUserId
                ? currentHistory?.error
                : 'Match history is unavailable: invalid player ID.'
            }
            onRetry={
              hasBackendUserId
                ? () => setHistoryAttempt((attempt) => attempt + 1)
                : undefined
            }
          />
      
      <div className="cm-modal__actions">
            <Button
              type="button"
              disabled={isMessageActionDisabled}
              onClick={() => runAction('message', onMessage)}
            >
              {isMessageActionPending ? 'Opening...' : 'Message'}
            </Button>
            <Button
              type="button"
              disabled={isFriendActionDisabled}
              variant="ghost"
              onClick={() => runAction('friend', friendAction)}
            >
              {isFriendActionPending ? 'Updating...' : friendActionLabel}
            </Button>
          </div>
        </PanelBody>
    </Modal>
  )
}

export default UserProfileModal
