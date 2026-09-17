import { useState } from 'react'

import Avatar from './Avatar.jsx'
import Modal from './Modal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  Alert,
  Badge,
  Button,
  Icon,
  IconButton,
  ListRow,
  PanelBody,
} from './ui.jsx'

function getMockMatchHistory(profileOwner) {
  // TODO: Replace the mock with backend match history.
  // This keeps modal mock data aligned with Profile.jsx, but from the selected player's perspective.
  const profilePageMatches = {
    Serhii: [
      { id: 1, white: 'DemoPlayer', black: profileOwner, winner: 'DemoPlayer', moves: 42 },
    ],
    Taulant: [
      { id: 1, white: 'DemoPlayer', black: profileOwner, winner: profileOwner, moves: 35 },
    ],
    Tatiana: [
      { id: 1, white: 'DemoPlayer', black: profileOwner, winner: null, moves: 58 },
    ],
  }

  const profileMatches = profilePageMatches[profileOwner] || []
  const fallbackMatches = profileMatches.length > 0
    ? []
    : [{ id: 1, white: profileOwner, black: 'Serhii', winner: 'Serhii', moves: 28 }]

  return [
    ...profileMatches,
    ...fallbackMatches,
    { id: 2, white: profileOwner, black: 'Lina', winner: profileOwner, moves: 41 },
    { id: 3, white: profileOwner, black: 'Mira', winner: null, moves: 36 },
  ]
}

function getMatchResult(match, profileOwner) {
  if (!match.winner) {
    return 'Draw'
  }

  return match.winner === profileOwner ? 'Win' : 'Loss'
}

function getResultBadgeClass(result) {
  if (result === 'Win') {
    return 'win'
  }

  if (result === 'Loss') {
    return 'loss'
  }

  return 'draw'
}

function getOpponent(match, profileOwner) {
  return match.white === profileOwner ? match.black : match.white
}

function UserProfileModal({
  player,
  onClose,
  onAddFriend,
  onMessage,
  onRemoveFriend,
}) {
  const { user } = useAuth()
  const matchHistory = getMockMatchHistory(player.nickname)
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

          <div className="cm-list" aria-label={`${player.nickname} match history`}>
            {matchHistory.map((match) => {
              const result = getMatchResult(match, player.nickname)
              const opponent = getOpponent(match, player.nickname)

              return (
                <ListRow as="article" key={match.id}>
                  <Icon className="text-accent" name="chess-rook" />
                  <div className="min-w-0">
                    <p className="text-primary truncate">vs {opponent}</p>
                    <p className="cm-muted">{match.moves} moves</p>
                  </div>
                  <Badge variant={getResultBadgeClass(result)}>{result}</Badge>
                </ListRow>
              )
            })}
          </div>
      
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
