import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../components/AppLayout'
import UserProfileModal from '../components/UserProfileModal'
import UserListRow from '../components/UserListRow.jsx'
import {
  Alert,
  Button,
  EmptyState,
  FormField,
  Input,
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
import { toModalPlayer } from '../utils/userProfile.js'

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

  const handleOpenProfileKeyDown = (event, friendship) => {
    if (event.target !== event.currentTarget) {
      return
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    handleOpenProfile(friendship)
  }

  const handleOpenRowKeyDown = (event, openProfile) => {
    if (event.target !== event.currentTarget) {
      return
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    openProfile()
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
    >
      <div className="cm-page-grid two">
        <div className="flex flex-col gap-5">
          {pageError && (
            <Alert>
              {pageError}
            </Alert>
          )}

          <Panel className="cm-scroll-panel flex flex-col flex-1">
            <PanelHeader
              action={
                <Button type="button" onClick={handleAddFriend} aria-expanded={isSearchOpen}>
                  {isSearchOpen ? 'Close Search' : 'Add Friend'}
                </Button>
              }
              eyebrow="Requests"
              title="Friend Requests"
            />
            <PanelBody className="flex flex-col gap-4">
              {isSearchOpen && (
                <>
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

                  {searchTerm.trim().length >= 2 && (
                    isSearchLoading ? (
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
                            <UserListRow
                              actions={(
                                <Button
                                  size="sm"
                                  type="button"
                                  disabled={isFriend || isSent || isSending}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    handleSendFriendRequest(user)
                                  }}
                                >
                                  {isFriend ? 'Friend' : isSent ? 'Request Sent' : 'Add'}
                                </Button>
                              )}
                              avatar={user.avatar}
                              key={user.id}
                              meta={user.rating}
                              name={user.username}
                              role="button"
                              onClick={() => handleOpenSearchProfile(user)}
                              onKeyDown={(event) => handleOpenRowKeyDown(
                                event,
                                () => handleOpenSearchProfile(user),
                              )}
                            />
                          )
                        })}
                      </div>
                    )
                  )}
                </>
              )}

              {isLoading ? (
                <EmptyState title="Loading requests..." />
              ) : incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
                <EmptyState title="No pending requests" />
              ) : (
                <div className="cm-list">
                  {incomingRequests.map((request) => {
                    const isProcessing = processingRequestIds.includes(request.id)

                    return (
                      <UserListRow
                        actions={(
                          <Toolbar onClick={(event) => event.stopPropagation()}>
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
                        )}
                        avatar={request.requester.avatar}
                        key={`incoming-${request.id}`}
                        meta={`${request.requester.rating} Incoming`}
                        name={request.requester.username}
                        role="button"
                        onClick={() => handleOpenIncomingRequestProfile(request)}
                        onKeyDown={(event) => handleOpenRowKeyDown(
                          event,
                          () => handleOpenIncomingRequestProfile(request),
                        )}
                      />
                    )
                  })}

                  {outgoingRequests.map((request) => (
                    <UserListRow
                      actions={(
                        <Button
                          size="sm"
                          type="button"
                          disabled={processingRequestIds.includes(request.id)}
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDeleteFriendRequest(request.id)
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      avatar={request.recipient.avatar}
                      key={`outgoing-${request.id}`}
                      meta={`${request.recipient.rating} Outgoing`}
                      name={request.recipient.username}
                      role="button"
                      onClick={() => handleOpenOutgoingRequestProfile(request)}
                      onKeyDown={(event) => handleOpenRowKeyDown(
                        event,
                        () => handleOpenOutgoingRequestProfile(request),
                      )}
                    />
                  ))}
                </div>
              )}
            </PanelBody>
          </Panel>
        </div>

        <Panel className="cm-scroll-panel flex flex-col">
          <PanelHeader eyebrow="Friends List" title="Friends" />
          <PanelBody>
            {isLoading ? (
              <EmptyState title="Loading friends..." />
            ) : friends.length === 0 ? (
              <EmptyState title="No friends yet" />
            ) : (
              <div className="cm-list">
                {friends.map((friendship) => {
                  const isRemoving = removingFriendIds.includes(friendship.user.id)

                  return (
                    <UserListRow
                      actions={(
                        <Toolbar onClick={(event) => event.stopPropagation()}>
                          <Button
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            Message
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            disabled={isRemoving}
                            variant="danger"
                            onClick={() => handleRemoveFriend(friendship.user.id)}
                          >
                            {isRemoving ? 'Removing...' : 'Remove'}
                          </Button>
                        </Toolbar>
                      )}
                      avatar={friendship.user.avatar}
                      key={friendship.friendshipId}
                      meta={friendship.user.rating}
                      name={friendship.user.username}
                      role="button"
                      showPresence
                      userId={friendship.user.id}
                      onClick={() => handleOpenProfile(friendship)}
                      onKeyDown={(event) => handleOpenProfileKeyDown(event, friendship)}
                    />
                  )
                })}
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
