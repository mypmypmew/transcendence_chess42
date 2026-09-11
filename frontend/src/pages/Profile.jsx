import { useEffect, useRef, useState } from 'react'

import Avatar from '../components/Avatar'
import AppLayout from '../components/AppLayout'
import MatchHistory from '../components/MatchHistory'
import UserProfileModal from '../components/UserProfileModal'
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
import './App.css'

function toModalPlayer(user) {
  return {
	id: user.id,
	avatar: user.avatar || null,
	nickname: user.username,
	rating: user.rating,
	isFriend: true,
  }
}

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
			<Avatar
			  avatar={avatarPreview}
			  name={user.username}
			  className="avatar avatar-xl avatar-ring"
			  aria-hidden="true"
			/>

			<div>
			  <p className="label">Player profile</p>
			  <h2 className="cm-section-title" id="profile-title">{user.username}</h2>
			  <p className="cm-muted">Your ChessMate personal account</p>
			</div>

			<div className="cm-list" aria-label="Profile details">
			  <ListRow>
				<Icon className="text-accent" name="chart-bar" />
				<span className="cm-muted">Rating</span>
				<strong className="text-primary">{user.rating}</strong>
			  </ListRow>
			  <ListRow>
				<Icon className="text-accent" name="mail" />
				<span className="cm-muted">Email</span>
				<strong className="text-primary truncate">{user.email}</strong>
			  </ListRow>
			</div>

			{avatarPreview && (
			  <p className="cm-muted">New avatar selected</p>
			)}

			<Button icon="camera" type="button" onClick={openAvatarPicker}>
			  Change avatar
			</Button>
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
				  <ListRow
					as="button"
					key={friendship.friendshipId}
					type="button"
					onClick={() => handleOpenFriendProfile(friendship)}
				  >
					<Avatar
					  avatar={friendship.user.avatar}
					  name={friendship.user.username}
					  className="avatar avatar-md"
					  aria-hidden="true"
					/>
					<div className="min-w-0 text-left">
					  <p className="text-primary truncate">{friendship.user.username}</p>
					  <p className="cm-muted">Rating {friendship.user.rating}</p>
					</div>

					<Icon className="cm-muted" name="chevron-right" />
				  </ListRow>
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
	</AppLayout>
  )
}

export default Profile
