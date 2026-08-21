// later API integration will be done from backend and handle actions like remove friend, open profile, message, and challenge.
import { useEffect, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Avatar from '../components/Avatar'
import UserProfileModal from '../components/UserProfileModal'
import { Link } from 'react-router-dom'
import { searchUsers, sendFriendRequest } from '../api/userApi.js'


const mockFriends = [
  { id: 1, avatar: null, nickname: 'Serhii', rating: 1812, games: 200, online: true },
  { id: 2, avatar: null, nickname: 'Taulant', rating: 1694, games: 150, online: false },
  { id: 3, avatar: null, nickname: 'Tatiana', rating: 1740, games: 178, online: true },
  { id: 4, avatar: null, nickname: 'Alima', rating: 1658, games: 132, online: false },
  { id: 5, avatar: null, nickname: 'Mira', rating: 1775, games: 98, online: true },
  { id: 6, avatar: null, nickname: 'Niko', rating: 1796, games: 88, online: false },
  { id: 7, avatar: null, nickname: 'Elena', rating: 1726, games: 76, online: false },
]

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [sentRequestIds, setSentRequestIds] = useState([])
  const [sendingRequestIds, setSendingRequestIds] = useState([])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFriends([...mockFriends])
      setIsLoading(false)
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const trimmedSearch = searchTerm.trim()

    if (!isSearchOpen || trimmedSearch.length < 2) {
      return
    }

    let isCancelled = false

    const timer = window.setTimeout(async () => {
      try {
        if (!isCancelled) {
          setIsSearchLoading(true)
          setSearchError(null)
        }

        const data = await searchUsers(trimmedSearch)

        if (!isCancelled) {
          setSearchResults(Array.isArray(data?.users) ? data.users : [])
        }
      } catch (error) {
        if (!isCancelled) {
          setSearchResults([])
          setSearchError(error.message)
        }
      } finally {
        if (!isCancelled) {
          setIsSearchLoading(false)
        }
      }
    }, 300)

    return () => {
      isCancelled = true
      window.clearTimeout(timer)
    }
  }, [isSearchOpen, searchTerm])

	
  const handleRemoveFriend = (friendId) => {
    setFriends((current) => current.filter((friend) => friend.id !== friendId))
    setSelectedFriend((current) => (current?.id === friendId ? null : current))
  }

	const handleOpenProfile = (friend) => {
    setSelectedFriend(friend)
  	}

	const handleMessage = (friend) => {
	<Link to={`/chat/${friend.id}`} className="btn btn-ghost btn-sm">
  	Message
	</Link>
	}

	const handleChallenge = (friend) => {
	<Link to={`/game-lobby?opponent=${friend.id}`} className="btn btn-ghost btn-sm">
  	Challenge
	</Link>
	}
	
	// TODO add API integration from backend to add friend
	const handleAddFriend = () => {
    if (isSearchOpen) {
      setSearchTerm('')
      setSearchResults([])
      setIsSearchLoading(false)
      setSearchError(null)
    }

    setIsSearchOpen((current) => !current)
	}

  const handleSearchTermChange = (event) => {
    const nextSearchTerm = event.target.value
    setSearchTerm(nextSearchTerm)

    if (nextSearchTerm.trim().length < 2) {
      setSearchResults([])
      setIsSearchLoading(false)
      setSearchError(null)
    }
  }

  const handleSendFriendRequest = async (user) => {
    setSendingRequestIds((current) => [...current, user.id])
    setSearchError(null)

    try {
      await sendFriendRequest(user.id)
      setSentRequestIds((current) => [...current, user.id])
    } catch (error) {
      setSearchError(error.message)
    } finally {
      setSendingRequestIds((current) => current.filter((id) => id !== user.id))
    }
  }

  return (
    <AppLayout 
      eyebrow="Friends" 
      title="Friends"
      actions={
        <button className="btn btn-primary" onClick={handleAddFriend}>
          Add Friend
        </button>
      }
    >
      <div className="cm-page-grid">
        {isSearchOpen && (
          <section className="cm-panel">
            <div className="cm-panel-header">
              <div>
                <p className="cm-eyebrow">Add Friend</p>
                <h2 className="cm-section-title">Search Users</h2>
              </div>
            </div>
            <div className="cm-panel-body">
              {searchError && (
                <div className="alert alert-error visible" role="alert">
                  <i className="ti ti-alert-circle" aria-hidden="true" />
                  {searchError}
                </div>
              )}

              <div className="field">
                <label className="field-label" htmlFor="friend-search">
                  Username
                </label>
                <input
                  className="input"
                  id="friend-search"
                  type="search"
                  value={searchTerm}
                  placeholder="Search username..."
                  onChange={handleSearchTermChange}
                />
              </div>

              {searchTerm.trim().length < 2 ? (
                <div className="empty-state">
                  <p>Enter at least 2 characters</p>
                </div>
              ) : isSearchLoading ? (
                <div className="empty-state">
                  <p>Searching users...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="empty-state">
                  <p>No users found</p>
                </div>
              ) : (
                <div className="cm-list">
                  {searchResults.map((user) => {
                    const isSent = sentRequestIds.includes(user.id)
                    const isSending = sendingRequestIds.includes(user.id)

                    return (
                      <div key={user.id} className="cm-list-row">
                        <Avatar
                          avatar={user.avatar}
                          name={user.username}
                          className="avatar avatar-md"
                        />

                        <div>
                          <div className="text-primary">{user.username}</div>
                          <div className="flex items-center gap-2">
                            <i className="ti ti-trophy text-accent" aria-hidden="true" />
                            <span className="text-muted">{user.rating}</span>
                          </div>
                        </div>

                        <button
                          className="btn btn-primary btn-sm"
                          type="button"
                          disabled={isSent || isSending}
                          onClick={() => handleSendFriendRequest(user)}
                        >
                          {isSent ? 'Request Sent' : 'Add'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="cm-panel">
          <div className="cm-panel-header">
            <div>
              <p className="cm-eyebrow">Friends List</p>
              <h2 className="cm-section-title">Friends</h2>
            </div>
          </div>
          <div className="cm-panel-body">
            {isLoading ? (
              <div className="empty-state">
                <p>Loading friends...</p>
              </div>
            ) : friends.length === 0 ? (
              <div className="empty-state">
                <p>No friends yet</p>
              </div>
            ) : (
              <div className="cm-list">
                {friends.map((friend) => (
                  <div key={friend.id} className="cm-list-row">
                    <Avatar
                      avatar={friend.avatar}
                      name={friend.nickname}
                      className="avatar avatar-md"
                    />
                    
                    <div>
                      <div 
                        className="text-primary"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleOpenProfile(friend)}
                      >
                        {friend.nickname}
                      </div>
                      <div className="flex items-center gap-2">
						<i className="ti ti-trophy text-accent" aria-hidden="true" />
						<span className="text-muted">{friend.rating}</span>
						<i className="ti ti-chess-rook text-accent" aria-hidden="true" />
						<span className="text-muted">{friend.games}</span>
						<span className={`status-dot ${friend.online ? 'online' : 'offline'}`} />
                        <span className="text-muted">
                          {friend.online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleMessage(friend)}
                      >
                        Message
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleChallenge(friend)}
                      >
                        Challenge
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveFriend(friend.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

	  {selectedFriend && (
	    <UserProfileModal player={selectedFriend} onClose={() => setSelectedFriend(null)} />
	  )}
    </AppLayout>
  )
}
