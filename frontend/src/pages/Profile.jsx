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
import { updateCurrentUser, uploadCurrentUserAvatar } from '../api/userApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useOpenConversation } from '../hooks/useOpenConversation.js'
import { toModalPlayer } from '../utils/userProfile.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/
const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp']

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

function getAvatarValidationError(file) {
  if (!file) {
    return null
  }

  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return 'Avatar must be a PNG, JPEG or WebP image'
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return 'Avatar must be 2 MB or smaller'
  }

  return null
}

function getUserFormValues(user) {
  return {
    username: user.username || '',
    email: user.email || '',
  }
}

function Profile() {
  const { user, refreshUser, replaceUser } = useAuth()
  const { startConversation } = useOpenConversation()
  const avatarInputRef = useRef(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
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

  useEffect(() => () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  useEffect(() => {
    if (!profileMessage) {
      return undefined
    }

    const hideMessageTimer = window.setTimeout(() => {
      setProfileMessage(null)
    }, 3000)

    return () => {
      window.clearTimeout(hideMessageTimer)
    }
  }, [profileMessage])

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

  function resetAvatarPreview() {
    setAvatarPreview((currentPreview) => {
      if (currentPreview) {
        // Release the temporary object URL after upload, cancel, or validation failure.
        URL.revokeObjectURL(currentPreview)
      }

      return null
    })
  }

  function openAvatarPicker() {
    setProfileError(null)
    setProfileMessage(null)
    avatarInputRef.current?.click()
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    const avatarError = getAvatarValidationError(file)

    if (avatarError) {
      // Keep the saved backend avatar visible when the selected file is clearly invalid.
      resetAvatarPreview()
      setProfileError(avatarError)
      setProfileMessage(null)
      return
    }

    // Show a temporary local preview only while the backend upload is in progress.
    resetAvatarPreview()
    setAvatarPreview(URL.createObjectURL(file))
    setIsAvatarUploading(true)
    setProfileError(null)
    setProfileMessage(null)

    try {
      const data = await uploadCurrentUserAvatar(file)
      const updatedUser = data?.user || await refreshUser()

      // Commit the avatar to shared auth state only after the backend accepts it.
      replaceUser(updatedUser)
      resetAvatarPreview()
      setProfileMessage('Avatar updated')
    } catch (error) {
      resetAvatarPreview()
      setProfileError(error.message || 'Avatar upload failed')
    } finally {
      setIsAvatarUploading(false)
    }
  }

  function handleEditProfile() {
    setIsEditing(true)
    setFieldErrors({})
    setProfileError(null)
    setProfileMessage(null)
    setFormValues(getUserFormValues(user))
  }

  function handleCancelEdit() {
    setIsEditing(false)
    setFieldErrors({})
    setProfileError(null)
    setProfileMessage(null)
    setFormValues(getUserFormValues(user))
  }

  function handleFieldChange(fieldName, value) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }))
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: '',
    }))
    setProfileError(null)
    setProfileMessage(null)
  }

  async function handleSaveProfile(event) {
    event.preventDefault()

    const nextErrors = getProfileErrors(formValues)
    setFieldErrors(nextErrors)
    setProfileError(null)
    setProfileMessage(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSavingProfile(true)

    try {
      const data = await updateCurrentUser({
        username: formValues.username.trim(),
        email: formValues.email.trim(),
      })
      const updatedUser = data?.user || await refreshUser()

      replaceUser(updatedUser)
      setFormValues({
        username: updatedUser.username || '',
        email: updatedUser.email || '',
      })
      setIsEditing(false)
      setProfileMessage('Profile updated')
    } catch (error) {
      setProfileError(error.message || 'Profile update failed')
    } finally {
      setIsSavingProfile(false)
    }
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

  async function handleOpenMessage(player) {
    await startConversation(player, {
      onSuccess: () => setSelectedFriend(null),
    })
  }

  if (!user) {
    return null
  }

  const isProfileBusy = isSavingProfile || isAvatarUploading

  return (
    <AppLayout
      eyebrow="Personal account"
      title="My profile"
    >
      {({ handleLogout, isLoggingOut, logoutError }) => (
        <>
          <div className="cm-profile-grid">
            <Panel aria-labelledby="profile-title" className="cm-profile-account-panel cm-profile-panel">
              <PanelBody className="flex flex-col gap-4 text-center">
                <input
                  accept={ALLOWED_AVATAR_TYPES.join(',')}
                  hidden
                  onChange={handleAvatarChange}
                  ref={avatarInputRef}
                  type="file"
                />
                <h4 className="label" id="profile-title">PLAYER PROFILE</h4>

                <div className="flex flex-col items-center gap-2">
                  <Avatar
                    avatar={avatarPreview || user.avatar}
                    name={user.username}
                    className="avatar avatar-xl avatar-ring"
                  />

                  <Button
                    className="profile-avatar-action"
                    disabled={isProfileBusy}
                    icon="camera"
                    onClick={openAvatarPicker}
                    type="button"
                    variant="link"
                  >
                    {isAvatarUploading ? 'Uploading...' : 'Change avatar'}
                  </Button>

                  <p className="stat-num text-primary truncate">{user.username}</p>
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
              className="cm-profile-history"
              games={games}
              currentUserId={user.id}
              error={historyError}
              isLoading={isHistoryLoading}
              pageSize={4}
            />

            <Panel aria-labelledby="friends-title" className="cm-profile-friends-panel cm-profile-panel">
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
              onMessage={handleOpenMessage}
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
