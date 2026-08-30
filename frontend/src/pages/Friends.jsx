import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Avatar from '../components/Avatar'
import UserProfileModal from '../components/UserProfileModal'
import {
  acceptFriendRequest,
  deleteFriendRequest,
  getFriendRequests,
  getFriends,
  removeFriend,
  sendFriendRequest,
} from '../api/friendshipApi.js'
import { searchUsers } from '../api/userApi.js'

function toModalPlayer(user, options = {}) {
  return {
    id: user.id,
    avatar: user.avatar || null,
    nickname: user.username,
    rating: user.rating,
    isFriend: options.isFriend ?? true,
    hasPendingFriendRequest: options.hasPendingFriendRequest ?? false,
  }
}

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState(null)
  const [incomingRequests, setIncomingRequests] = useState([])
  const [outgoingRequests, setOutgoingRequests] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [sendingRequestIds, setSendingRequestIds] = useState([])
  const [processingRequestIds, setProcessingRequestIds] = useState([])
  const [removingFriendIds, setRemovingFriendIds] = useState([])

  const friendUserIds = useMemo(
    () => friends.map((friendship) => friendship.user.id),
    [friends],
  )

  const outgoingRecipientIds = useMemo(
    () => outgoingRequests.map((request) => request.recipient.id),
    [outgoingRequests],
  )

  useEffect(() => {
    let isCancelled = false

    const timer = window.setTimeout(async () => {
      try {
        if (!isCancelled) {
          setIsLoading(true)
          setPageError(null)
        }

        const [friendsData, requestsData] = await Promise.all([
          getFriends(),
          getFriendRequests(),
        ])

        if (!isCancelled) {
          setFriends(Array.isArray(friendsData?.friends) ? friendsData.friends : [])
          setIncomingRequests(
            Array.isArray(requestsData?.incoming) ? requestsData.incoming : [],
          )
          setOutgoingRequests(
            Array.isArray(requestsData?.outgoing) ? requestsData.outgoing : [],
          )
        }
      } catch (error) {
        if (!isCancelled) {
          setPageError(error.message)
          setFriends([])
          setIncomingRequests([])
          setOutgoingRequests([])
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

  const handleOpenSearchProfile = (user) => {
    setSelectedFriend(toModalPlayer(user, {
      isFriend: friendUserIds.includes(user.id),
      hasPendingFriendRequest: outgoingRecipientIds.includes(user.id),
    }))
  }

  const handleOpenIncomingRequestProfile = (request) => {
    setSelectedFriend(toModalPlayer(request.requester, {
      isFriend: false,
    }))
  }

  const handleOpenOutgoingRequestProfile = (request) => {
    setSelectedFriend(toModalPlayer(request.recipient, {
      isFriend: false,
      hasPendingFriendRequest: true,
    }))
  }

  const handleRemoveFriend = async (friendUserId) => {
    setRemovingFriendIds((current) => [...current, friendUserId])
    setPageError(null)

    try {
      await removeFriend(friendUserId)
      setFriends((current) => (
        current.filter((friendship) => friendship.user.id !== friendUserId)
      ))
      setSelectedFriend((current) => (current?.id === friendUserId ? null : current))
    } catch (error) {
      setPageError(error.message)
    } finally {
      setRemovingFriendIds((current) => current.filter((id) => id !== friendUserId))
    }
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

  const handleSendFriendRequest = async (user, options = {}) => {
    setSendingRequestIds((current) => [...current, user.id])
    setSearchError(null)

    try {
      const data = await sendFriendRequest(user.id)
      if (data?.request) {
        setOutgoingRequests((current) => [...current, data.request])
        setSelectedFriend((current) => (
          current?.id === user.id
            ? { ...current, hasPendingFriendRequest: true }
            : current
        ))
      }
    } catch (error) {
      setSearchError(error.message)
      if (options.throwOnError) {
        throw error
      }
    } finally {
      setSendingRequestIds((current) => current.filter((id) => id !== user.id))
    }
  }

  const handleAcceptFriendRequest = async (request) => {
    setProcessingRequestIds((current) => [...current, request.id])
    setPageError(null)

    try {
      await acceptFriendRequest(request.id)
      setIncomingRequests((current) => current.filter((item) => item.id !== request.id))
      setFriends((current) => [
        ...current,
        {
          friendshipId: request.id,
          user: request.requester,
        },
      ])
    } catch (error) {
      setPageError(error.message)
    } finally {
      setProcessingRequestIds((current) => current.filter((id) => id !== request.id))
    }
  }

  const handleDeleteFriendRequest = async (requestId) => {
    setProcessingRequestIds((current) => [...current, requestId])
    setPageError(null)

    try {
      await deleteFriendRequest(requestId)
      setIncomingRequests((current) => current.filter((request) => request.id !== requestId))
      setOutgoingRequests((current) => current.filter((request) => request.id !== requestId))
    } catch (error) {
      setPageError(error.message)
    } finally {
      setProcessingRequestIds((current) => current.filter((id) => id !== requestId))
    }
  }

  return (
    <AppLayout 
      eyebrow="Friends" 
      title="Friends"
      showLegalFooter={false}
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
                    const isSent = outgoingRecipientIds.includes(user.id)
                    const isSending = sendingRequestIds.includes(user.id)

                    return (
                      <div key={user.id} className="cm-list-row">
                        <Avatar
                          avatar={user.avatar}
                          name={user.username}
                          className="avatar avatar-md"
                        />

                        <div>
                          <button
                            className="btn btn-ghost btn-sm"
                            type="button"
                            onClick={() => handleOpenSearchProfile(user)}
                          >
                            {user.username}
                          </button>
                          <div className="flex items-center gap-2">
                            <i className="ti ti-trophy text-accent" aria-hidden="true" />
                            <span className="text-muted">{user.rating}</span>
                          </div>
                        </div>

                        <button
                          className="btn btn-primary btn-sm"
                          type="button"
                          disabled={isFriend || isSent || isSending}
                          onClick={() => handleSendFriendRequest(user)}
                        >
                          {isFriend ? 'Friend' : isSent ? 'Request Sent' : 'Add'}
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
              <p className="cm-eyebrow">Requests</p>
              <h2 className="cm-section-title">Friend Requests</h2>
            </div>
          </div>
          <div className="cm-panel-body">
            {isLoading ? (
              <div className="empty-state">
                <p>Loading requests...</p>
              </div>
            ) : incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
              <div className="empty-state">
                <p>No pending requests</p>
              </div>
            ) : (
              <div className="cm-list">
                {incomingRequests.map((request) => {
                  const isProcessing = processingRequestIds.includes(request.id)

                  return (
                    <div key={`incoming-${request.id}`} className="cm-list-row">
                      <Avatar
                        avatar={request.requester.avatar}
                        name={request.requester.username}
                        className="avatar avatar-md"
                      />
                      <div>
                        <button
                          className="btn btn-ghost btn-sm"
                          type="button"
                          onClick={() => handleOpenIncomingRequestProfile(request)}
                        >
                          {request.requester.username}
                        </button>
                        <div className="flex items-center gap-2">
                          <i className="ti ti-trophy text-accent" aria-hidden="true" />
                          <span className="text-muted">{request.requester.rating}</span>
                          <span className="text-muted">Incoming</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAcceptFriendRequest(request)}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleDeleteFriendRequest(request.id)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )
                })}

                {outgoingRequests.map((request) => (
                  <div key={`outgoing-${request.id}`} className="cm-list-row">
                    <Avatar
                      avatar={request.recipient.avatar}
                      name={request.recipient.username}
                      className="avatar avatar-md"
                    />
                    <div>
                      <button
                        className="btn btn-ghost btn-sm"
                        type="button"
                        onClick={() => handleOpenOutgoingRequestProfile(request)}
                      >
                        {request.recipient.username}
                      </button>
                      <div className="flex items-center gap-2">
                        <i className="ti ti-trophy text-accent" aria-hidden="true" />
                        <span className="text-muted">{request.recipient.rating}</span>
                        <span className="text-muted">Outgoing</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      disabled={processingRequestIds.includes(request.id)}
                      onClick={() => handleDeleteFriendRequest(request.id)}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

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
                        disabled={removingFriendIds.includes(friendship.user.id)}
                        onClick={() => handleRemoveFriend(friendship.user.id)}
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
	    <UserProfileModal
        player={selectedFriend}
        onAddFriend={(player) => handleSendFriendRequest(player, { throwOnError: true })}
        onRemoveFriend={(player) => handleRemoveFriend(player.id)}
        onClose={() => setSelectedFriend(null)}
      />
	  )}
    </AppLayout>
  )
}
