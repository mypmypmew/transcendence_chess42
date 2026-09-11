import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Avatar from '../components/Avatar'
import UserProfileModal from '../components/UserProfileModal'
import {
  Alert,
  Button,
  EmptyState,
  FormField,
  Icon,
  Input,
  ListRow,
  Panel,
  PanelBody,
  PanelHeader,
  Toolbar,
} from '../components/ui.jsx'
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
    friendActionLabel: options.friendActionLabel,
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
      hasPendingFriendRequest: true,
      friendActionLabel: 'Request received',
    }))
  }

  const handleOpenOutgoingRequestProfile = (request) => {
    setSelectedFriend(toModalPlayer(request.recipient, {
      isFriend: false,
      hasPendingFriendRequest: true,
      friendActionLabel: 'Request sent',
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
            ? {
                ...current,
                hasPendingFriendRequest: true,
                friendActionLabel: 'Request sent',
              }
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
        <Button onClick={handleAddFriend}>
          Add Friend
        </Button>
      }
    >
      <div className="cm-page-grid">
        {pageError && (
          <Alert>
            {pageError}
          </Alert>
        )}

        {isSearchOpen && (
          <Panel>
            <PanelHeader eyebrow="Add Friend" title="Search Users" />
            <PanelBody>
              {searchError && (
                <Alert>
                  {searchError}
                </Alert>
              )}

              <FormField label="Username" labelFor="friend-search">
                <Input
                  id="friend-search"
                  type="search"
                  value={searchTerm}
                  placeholder="Search username..."
                  onChange={handleSearchTermChange}
                />
              </FormField>

              {searchTerm.trim().length < 2 ? (
                <EmptyState title="Enter at least 2 characters" />
              ) : isSearchLoading ? (
                <EmptyState title="Searching users..." />
              ) : searchResults.length === 0 ? (
                <EmptyState title="No users found" />
              ) : (
                <div className="cm-list">
                  {searchResults.map((user) => {
                    const isFriend = friendUserIds.includes(user.id)
                    const isSent = outgoingRecipientIds.includes(user.id)
                    const isSending = sendingRequestIds.includes(user.id)

                    return (
                      <ListRow key={user.id}>
                        <Avatar
                          avatar={user.avatar}
                          name={user.username}
                          className="avatar avatar-md"
                        />

                        <div>
                          <Button
                            size="sm"
                            type="button"
                            variant="ghost"
                            onClick={() => handleOpenSearchProfile(user)}
                          >
                            {user.username}
                          </Button>
                          <div className="flex items-center gap-2">
                            <Icon className="text-accent" name="trophy" />
                            <span className="text-muted">{user.rating}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          type="button"
                          disabled={isFriend || isSent || isSending}
                          onClick={() => handleSendFriendRequest(user)}
                        >
                          {isFriend ? 'Friend' : isSent ? 'Request Sent' : 'Add'}
                        </Button>
                      </ListRow>
                    )
                  })}
                </div>
              )}
            </PanelBody>
          </Panel>
        )}

        <Panel>
          <PanelHeader eyebrow="Requests" title="Friend Requests" />
          <PanelBody>
            {isLoading ? (
              <EmptyState title="Loading requests..." />
            ) : incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
              <EmptyState title="No pending requests" />
            ) : (
              <div className="cm-list">
                {incomingRequests.map((request) => {
                  const isProcessing = processingRequestIds.includes(request.id)

                  return (
                    <ListRow key={`incoming-${request.id}`}>
                      <Avatar
                        avatar={request.requester.avatar}
                        name={request.requester.username}
                        className="avatar avatar-md"
                      />
                      <div>
                        <Button
                          size="sm"
                          type="button"
                          variant="ghost"
                          onClick={() => handleOpenIncomingRequestProfile(request)}
                        >
                          {request.requester.username}
                        </Button>
                        <div className="flex items-center gap-2">
                          <Icon className="text-accent" name="trophy" />
                          <span className="text-muted">{request.requester.rating}</span>
                          <span className="text-muted">Incoming</span>
                        </div>
                      </div>
                      <Toolbar>
                        <Button
                          size="sm"
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleAcceptFriendRequest(request)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          type="button"
                          disabled={isProcessing}
                          variant="ghost"
                          onClick={() => handleDeleteFriendRequest(request.id)}
                        >
                          Decline
                        </Button>
                      </Toolbar>
                    </ListRow>
                  )
                })}

                {outgoingRequests.map((request) => (
                  <ListRow key={`outgoing-${request.id}`}>
                    <Avatar
                      avatar={request.recipient.avatar}
                      name={request.recipient.username}
                      className="avatar avatar-md"
                    />
                    <div>
                      <Button
                        size="sm"
                        type="button"
                        variant="ghost"
                        onClick={() => handleOpenOutgoingRequestProfile(request)}
                      >
                        {request.recipient.username}
                      </Button>
                      <div className="flex items-center gap-2">
                        <Icon className="text-accent" name="trophy" />
                        <span className="text-muted">{request.recipient.rating}</span>
                        <span className="text-muted">Outgoing</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      type="button"
                      disabled={processingRequestIds.includes(request.id)}
                      variant="ghost"
                      onClick={() => handleDeleteFriendRequest(request.id)}
                    >
                      Cancel
                    </Button>
                  </ListRow>
                ))}
              </div>
            )}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Friends List" title="Friends" />
          <PanelBody>
            {isLoading ? (
              <EmptyState title="Loading friends..." />
            ) : friends.length === 0 ? (
              <EmptyState title="No friends yet" />
            ) : (
              <div className="cm-list">
                {friends.map((friendship) => (
                  <ListRow key={friendship.friendshipId}>
                    <Avatar
                      avatar={friendship.user.avatar}
                      name={friendship.user.username}
                      className="avatar avatar-md"
                    />
                    
                    <div>
                      <Button
                        size="sm"
                        type="button"
                        variant="ghost"
                        onClick={() => handleOpenProfile(friendship)}
                      >
                        {friendship.user.username}
                      </Button>
                      <div className="flex items-center gap-2">
                        <Icon className="text-accent" name="trophy" />
                        <span className="text-muted">{friendship.user.rating}</span>
                      </div>
                    </div>

                    <Toolbar>
                      <Button
                        size="sm"
                        type="button"
                        disabled
                        variant="ghost"
                      >
                        Message
                      </Button>
                      <Button
                        size="sm"
                        type="button"
                        disabled
                        variant="ghost"
                      >
                        Challenge
                      </Button>
                      <Button
                        size="sm"
                        type="button"
                        disabled={removingFriendIds.includes(friendship.user.id)}
                        variant="danger"
                        onClick={() => handleRemoveFriend(friendship.user.id)}
                      >
                        Remove
                      </Button>
                    </Toolbar>
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
        onAddFriend={(player) => handleSendFriendRequest(player, { throwOnError: true })}
        onRemoveFriend={(player) => handleRemoveFriend(player.id)}
        onClose={() => setSelectedFriend(null)}
      />
	  )}
    </AppLayout>
  )
}
