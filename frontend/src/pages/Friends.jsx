import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Avatar from '../components/Avatar'
import UserProfileModal from '../components/UserProfileModal'
import { getFriends } from '../api/friendshipApi.js'
import { searchUsers } from '../api/userApi.js'

function toModalPlayer(user) {
  return {
    id: user.id,
    avatar: user.avatar || null,
    nickname: user.username,
    rating: user.rating,
    isFriend: true,
  }
}

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState(null)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)

  const friendUserIds = useMemo(
    () => friends.map((friendship) => friendship.user.id),
    [friends],
  )

  useEffect(() => {
    let isCancelled = false

    const timer = window.setTimeout(async () => {
      try {
        if (!isCancelled) {
          setIsLoading(true)
          setPageError(null)
        }

        const friendsData = await getFriends()

        if (!isCancelled) {
          setFriends(Array.isArray(friendsData?.friends) ? friendsData.friends : [])
        }
      } catch (error) {
        if (!isCancelled) {
          setPageError(error.message)
          setFriends([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }, 0)

    return () => {
      isCancelled = true
      window.clearTimeout(timer)
    }
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

  const handleOpenProfile = (friendship) => {
    setSelectedFriend(toModalPlayer(friendship.user))
  }
	
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
        {pageError && (
          <div className="alert alert-error visible" role="alert">
            <i className="ti ti-alert-circle" aria-hidden="true" />
            {pageError}
          </div>
        )}

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
                    const isFriend = friendUserIds.includes(user.id)

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
                          disabled
                        >
                          {isFriend ? 'Friend' : 'Add'}
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
                {friends.map((friendship) => (
                  <div key={friendship.friendshipId} className="cm-list-row">
                    <Avatar
                      avatar={friendship.user.avatar}
                      name={friendship.user.username}
                      className="avatar avatar-md"
                    />
                    
                    <div>
                      <div 
                        className="text-primary"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleOpenProfile(friendship)}
                      >
                        {friendship.user.username}
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="ti ti-trophy text-accent" aria-hidden="true" />
                        <span className="text-muted">{friendship.user.rating}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        className="btn btn-ghost btn-sm"
                        type="button"
                        disabled
                      >
                        Message
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm"
                        type="button"
                        disabled
                      >
                        Challenge
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        type="button"
                        disabled
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
