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
  FormField,
  Icon,
  Input,
  Panel,
  PanelBody,
  PanelHeader,
  Toolbar,
} from '../components/ui.jsx'
import { getFriends, removeFriend } from '../api/friendshipApi'
import { getGames } from '../api/gameApi'
import { updateCurrentUser } from '../api/userApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toModalPlayer } from '../utils/userProfile.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/

function getProfileErrors({ username, email }) {
  const errors = {}

  if (!USERNAME_PATTERN.test(username.trim())) {
    errors.username = 'Use 3-20 characters: letters, numbers, and underscore'
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address'
  }

  return errors
}

function getUserFormValues(user) {
  return {
    username: user.username || '',
    email: user.email || '',
  }
}

function Profile() {
  const { user, refreshUser, replaceUser } = useAuth()
  const avatarInputRef = useRef(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formValues, setFormValues] = useState({ username: '', email: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [profileError, setProfileError] = useState(null)
  const [profileMessage, setProfileMessage] = useState(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
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

                <hr
                  aria-hidden="true"
                  style={{
                    border: 0,
                    borderTop: '1px solid var(--border-subtle)',
                    width: '100%',
                  }}
                />

                <div className="flex flex-col gap-4 text-left" aria-label="Profile details">
                  <div className="flex flex-col gap-1">
                    <p className="label flex items-center gap-2">
                      <Icon className="text-accent" name="chart-line" />
                      <span>Rating</span>
                    </p>
                    <p className="text-primary">{user.rating}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="label flex items-center gap-2">
                      <Icon className="text-accent" name="mail" />
                      <span>Email</span>
                    </p>
                    <p className="text-secondary truncate">{user.email}</p>
                  </div>
                </div>

                {profileError && (
                  <Alert>{profileError}</Alert>
                )}

                {profileMessage && (
                  <Alert icon="check" variant="success">{profileMessage}</Alert>
                )}

                {isEditing ? (
                  <form className="flex flex-col gap-4 text-left" onSubmit={handleSaveProfile} noValidate>
                    <FormField
                      error={fieldErrors.username}
                      errorId="profile-username-error"
                      label="Username"
                      labelFor="profile-username"
                    >
                      <Input
                        aria-describedby={fieldErrors.username ? 'profile-username-error' : undefined}
                        aria-invalid={Boolean(fieldErrors.username)}
                        autoComplete="username"
                        hasError={Boolean(fieldErrors.username)}
                        id="profile-username"
                        name="username"
                        onChange={(event) => handleFieldChange('username', event.target.value)}
                        type="text"
                        value={formValues.username}
                      />
                    </FormField>

                    <FormField
                      error={fieldErrors.email}
                      errorId="profile-email-error"
                      label="Email"
                      labelFor="profile-email"
                    >
                      <Input
                        aria-describedby={fieldErrors.email ? 'profile-email-error' : undefined}
                        aria-invalid={Boolean(fieldErrors.email)}
                        autoComplete="email"
                        hasError={Boolean(fieldErrors.email)}
                        id="profile-email"
                        inputMode="email"
                        name="email"
                        onChange={(event) => handleFieldChange('email', event.target.value)}
                        type="email"
                        value={formValues.email}
                      />
                    </FormField>

                    <Toolbar className="justify-center">
                      <Button disabled={isProfileBusy} icon="check" size="sm" type="submit">
                        {isSavingProfile ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        disabled={isProfileBusy}
                        onClick={handleCancelEdit}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        Cancel
                      </Button>
                    </Toolbar>
                  </form>
                ) : (
                  <Toolbar className="justify-center">
                    <Button
                      disabled={isProfileBusy}
                      icon="edit"
                      onClick={handleEditProfile}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      Edit profile
                    </Button>
                  </Toolbar>
                )}

                <div className="flex flex-col gap-3 items-center">
                  <Button
                    disabled={isLoggingOut || isProfileBusy}
                    icon="logout"
                    onClick={handleLogout}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Log out'}
                  </Button>
                  {logoutError && (
                    <Alert>{logoutError}</Alert>
                  )}
                </div>
              </PanelBody>
            </Panel>

            <MatchHistory
              className="cm-scroll-panel"
              games={games}
              currentUserId={user.id}
              error={historyError}
              isLoading={isHistoryLoading}
            />

            <Panel aria-labelledby="friends-title" className="cm-profile-friends-panel">
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
