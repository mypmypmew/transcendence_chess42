import { useCallback, useState } from 'react'

import Avatar from './Avatar.jsx'
import Modal from './Modal.jsx'
import MatchHistory from './MatchHistory.jsx'
import { getPlayerGames, getPublicProfile } from '../api/userApi.js'
import useFreshRatingData from '../hooks/useFreshRatingData.js'
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

  const playerId = player.id

  const loadProfile = useCallback(async ({ signal }) => {
    const [freshPlayer, history] = await Promise.all([
      getPublicProfile(playerId, { signal }),
      getPlayerGames(playerId, { signal }),
    ])

    if (!Array.isArray(history?.games)) {
      throw new Error('Invalid match history response')
    }

    return {
      player: freshPlayer,
      games: history.games,
    }
  }, [playerId])

  const profileState = useFreshRatingData(loadProfile, playerId)
  const currentHistory = profileState.data

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
            <Avatar
              avatar={currentHistory ? currentHistory.player.avatar : player.avatar}
              name={currentHistory?.player.username ?? player.nickname}
              className="avatar avatar-md"
              aria-hidden="true"
            />
            <div>
              <h2 className="cm-section-title" id="profile-modal-title">
                {currentHistory?.player.username ?? player.nickname}
              </h2>
              <p className="cm-muted" aria-live="polite">
                Rating {profileState.isLoading
                  ? 'Updating...'
                  : currentHistory?.player.rating ?? '-'}
              </p>
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
            isLoading={profileState.isLoading}
            error={profileState.error}
            onRetry={profileState.retry}
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
