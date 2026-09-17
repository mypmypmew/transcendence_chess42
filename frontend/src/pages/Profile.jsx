import { useEffect, useRef, useState } from 'react'

import Avatar from '../components/Avatar'
import AppLayout from '../components/AppLayout'
import MatchHistory from '../components/MatchHistory'
import UserProfileModal from '../components/UserProfileModal'
import UserListRow from '../components/UserListRow.jsx'
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Icon,
  ListRow,
  Panel,
  PanelBody,
  PanelHeader,
} from '../components/ui.jsx'
import { getFriends, removeFriend } from '../api/friendshipApi'
import { getGames } from '../api/gameApi'
import { useAuth } from '../context/AuthContext.jsx'
import { toModalPlayer } from '../utils/userProfile.js'

function Profile() {
  const { user } = useAuth()
  const avatarInputRef = useRef(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [games, setGames] = useState([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState(null)
  const [friends, setFriends] = useState([])
  const [isFriendsLoading, setIsFriendsLoading] = useState(true)
  const [friendsError, setFriendsError] = useState(null)
  const [selectedFriend, setSelectedFriend] = useState(null)

  useEffect(() => {
  return () => {
    if (avatarPreview) {
    URL.revokeObjectURL(avatarPreview)
    }
  }
  }, [avatarPreview])

  useEffect(() => {
  let isMounted = true

  async function loadGames() {
    setIsHistoryLoading(true)
    setHistoryError(null)

    try {
    const data = await getGames()

    if (isMounted) {
      setGames(Array.isArray(data?.games) ? data.games : [])
    }
    } catch (error) {
    if (isMounted) {
      setHistoryError(error.message)
    }
    } finally {
    if (isMounted) {
      setIsHistoryLoading(false)
    }
    }
  }

  loadGames()

  return () => {
    isMounted = false
  }
  }, [])

  useEffect(() => {
  let isMounted = true

  async function loadFriends() {
    setIsFriendsLoading(true)
    setFriendsError(null)

    try {
    const data = await getFriends()

    if (isMounted) {
      setFriends(Array.isArray(data?.friends) ? data.friends : [])
    }
    } catch (error) {
    if (isMounted) {
      setFriends([])
      setFriendsError(error.message)
    }
    } finally {
    if (isMounted) {
      setIsFriendsLoading(false)
    }
    }
  }

  loadFriends()

  return () => {
    isMounted = false
  }
  }, [])

  function openAvatarPicker() {
  avatarInputRef.current?.click()
  }

  function handleAvatarChange(event) {
  const file = event.target.files?.[0]

  if (!file || !file.type.startsWith('image/')) {
    return
  }

  if (avatarPreview) {
    URL.revokeObjectURL(avatarPreview)
  }

  setAvatarPreview(URL.createObjectURL(file))
  }

  function handleOpenFriendProfile(friendship) {
  setSelectedFriend(toModalPlayer(friendship.user))
  }

  async function handleRemoveFriend(player) {
  await removeFriend(player.id)
  setFriends((current) => (
    current.filter((friendship) => friendship.user.id !== player.id)
  ))
  setSelectedFriend(null)
  }

  if (!user) {
  return null
  }

  return (
  <AppLayout
    eyebrow="Personal account"
    title="My profile"
  >
    {({ handleLogout, isLoggingOut, logoutError }) => (
    <>
      <div className="cm-profile-grid">
      <Panel aria-labelledby="profile-title">
        <PanelBody className="flex flex-col items-center gap-5 text-center">
        <input
          accept="image/*"
          hidden
          onChange={handleAvatarChange}
          ref={avatarInputRef}
          type="file"
        />
        <h4 className="label" id="profile-title">PLAYER PROFILE</h4>

        <div className="flex flex-col items-center gap-2">
          <Avatar
            avatar={avatarPreview}
            name={user.username}
            className="avatar avatar-xl avatar-ring"
            aria-hidden="true"
          />

          {avatarPreview && (
            <p className="cm-muted">New avatar selected</p>
          )}

          <Button
            className="profile-avatar-action"
            icon="camera"
            onClick={openAvatarPicker}
            type="button"
            variant="link"
          >
            Change avatar
          </Button>
        </div>

        <ListRow as="article" aria-label="Profile details">
          <span aria-hidden="true" />
          <div className="min-w-0 text-center flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-primary truncate">{user.username}</p>
              <p className="cm-muted flex items-center justify-center gap-2">
                <Icon className="text-accent" name="trophy" />
                <span>{user.rating}</span>
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="label flex items-center justify-center gap-2">
                <Icon className="text-accent" name="mail" />
                <span>Email</span>
              </p>
              <strong className="profile-email text-muted truncate">{user.email}</strong>
            </div>
          </div>
          <span aria-hidden="true" />
        </ListRow>

        <div className="flex flex-col gap-3 items-center">
          <Button icon="logout" size="sm" type="button" variant="ghost" disabled={isLoggingOut} onClick={handleLogout}>
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </Button>
          {logoutError && (
            <Alert>{logoutError}</Alert>
          )}
        </div>
        </PanelBody>
      </Panel>

      <MatchHistory
        games={games}
        currentUserId={user.id}
        error={historyError}
        isLoading={isHistoryLoading}
      />

      <Panel aria-labelledby="friends-title">
        <PanelHeader
        action={<Badge>{friends.length}</Badge>}
        eyebrow="Community"
        title="Friends list"
        titleId="friends-title"
        />

        <PanelBody>
        {friendsError && (
          <Alert>{friendsError}</Alert>
        )}

        {isFriendsLoading ? (
          <EmptyState title="Loading friends..." />
        ) : friends.length === 0 ? (
          <EmptyState title="No friends yet" />
        ) : (
          <div className="cm-list">
          {friends.map((friendship) => (
              <UserListRow
                actions={<Icon className="cm-muted" name="chevron-right" />}
                avatar={friendship.user.avatar}
                key={friendship.friendshipId}
                meta={`Rating ${friendship.user.rating}`}
                name={friendship.user.username}
                showPresence
                userId={friendship.user.id}
                onClick={() => handleOpenFriendProfile(friendship)}
              />
          ))}
          </div>
        )}
        </PanelBody>
      </Panel>
      </div>

      {selectedFriend && (
      <UserProfileModal
        player={selectedFriend}
        onRemoveFriend={handleRemoveFriend}
        onClose={() => setSelectedFriend(null)}
      />
      )}
    </>
    )}
  </AppLayout>
  )
}

export default Profile
