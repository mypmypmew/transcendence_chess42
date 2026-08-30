import { useEffect, useRef, useState } from 'react'

import Avatar from '../components/Avatar'
import AppLayout from '../components/AppLayout'
import MatchHistory from '../components/MatchHistory'
import UserProfileModal from '../components/UserProfileModal'
import { getFriends } from '../api/friendshipApi'
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

  if (!user) {
	return null
  }

  return (
	<AppLayout
	  eyebrow="Personal account"
	  title="My profile"
	>
	  <div className="cm-profile-grid">
		<section className="cm-panel" aria-labelledby="profile-title">
		  <div className="cm-panel-body flex flex-col items-center gap-5 text-center">
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
			  <div className="cm-list-row">
				<i className="ti ti-chart-bar text-accent" aria-hidden="true" />
				<span className="cm-muted">Rating</span>
				<strong className="text-primary">{user.rating}</strong>
			  </div>
			  <div className="cm-list-row">
				<i className="ti ti-mail text-accent" aria-hidden="true" />
				<span className="cm-muted">Email</span>
				<strong className="text-primary truncate">{user.email}</strong>
			  </div>
			</div>

			{avatarPreview && (
			  <p className="cm-muted">New avatar selected</p>
			)}

			<button className="btn btn-primary" type="button" onClick={openAvatarPicker}>
			  <i className="ti ti-camera" aria-hidden="true" />
			  Change avatar
			</button>
		  </div>
		</section>

		<MatchHistory
		  games={games}
		  currentUserId={user.id}
		  error={historyError}
		  isLoading={isHistoryLoading}
		/>

		<section className="cm-panel" aria-labelledby="friends-title">
		  <div className="cm-panel-header">
			<div>
			  <p className="label">Community</p>
			  <h2 className="cm-section-title" id="friends-title">Friends list</h2>
			</div>
			<span className="badge badge-accent">{friends.length}</span>
		  </div>

		  <div className="cm-panel-body">
			{friendsError && (
			  <div className="alert alert-error visible" role="alert">
				<i className="ti ti-alert-circle" aria-hidden="true" />
				{friendsError}
			  </div>
			)}

			{isFriendsLoading ? (
			  <div className="empty-state">
				<p>Loading friends...</p>
			  </div>
			) : friends.length === 0 ? (
			  <div className="empty-state">
				<p>No friends yet</p>
			  </div>
			) : (
			  <div className="cm-list">
				{friends.map((friendship) => (
				  <button
					className="cm-list-row"
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

					<i className="ti ti-chevron-right cm-muted" aria-hidden="true" />
				  </button>
				))}
			  </div>
			)}
		  </div>
		</section>
	  </div>

	  {selectedFriend && (
		<UserProfileModal
		  player={selectedFriend}
		  onClose={() => setSelectedFriend(null)}
		/>
	  )}
	</AppLayout>
  )
}

export default Profile
