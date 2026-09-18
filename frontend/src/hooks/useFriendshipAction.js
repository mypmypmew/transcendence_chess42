import { useCallback, useEffect, useRef, useState } from 'react'

import {
  acceptFriendRequest,
  getFriendRequests,
  getFriends,
  sendFriendRequest,
} from '../api/friendshipApi.js'

function getFriendshipForTarget(targetUserId, friendsData, requestsData) {
  const friends = Array.isArray(friendsData?.friends) ? friendsData.friends : []
  const incoming = Array.isArray(requestsData?.incoming) ? requestsData.incoming : []
  const outgoing = Array.isArray(requestsData?.outgoing) ? requestsData.outgoing : []

  if (friends.some((friendship) => friendship.user?.id === targetUserId)) {
    return { status: 'friends', request: null }
  }

  const incomingRequest = incoming.find((request) => request.requester?.id === targetUserId)
  if (incomingRequest) {
    return { status: 'incoming', request: incomingRequest }
  }

  const outgoingRequest = outgoing.find((request) => request.recipient?.id === targetUserId)
  if (outgoingRequest) {
    return { status: 'outgoing', request: outgoingRequest }
  }

  return { status: 'none', request: null }
}

async function loadFriendship(targetUserId) {
  const [friendsData, requestsData] = await Promise.all([
    getFriends(),
    getFriendRequests(),
  ])

  return getFriendshipForTarget(targetUserId, friendsData, requestsData)
}

function createState(targetUserId) {
  return {
    targetUserId,
    status: null,
    request: null,
    isLoading: Number.isInteger(targetUserId) && targetUserId > 0,
    isSubmitting: false,
    error: null,
  }
}

function useFriendshipAction(targetUserId) {
  const requestRef = useRef(0)
  const [state, setState] = useState(() => createState(targetUserId))
  const isValidTarget = Number.isInteger(targetUserId) && targetUserId > 0

  const refresh = useCallback(async ({ clearError = false } = {}) => {
    if (!isValidTarget) {
      requestRef.current += 1
      setState(createState(targetUserId))
      return
    }

    const requestId = requestRef.current + 1
    requestRef.current = requestId

    setState((current) => ({
      ...createState(targetUserId),
      error: clearError ? null : current.error,
    }))

    try {
      const next = await loadFriendship(targetUserId)

      if (requestRef.current !== requestId) {
        return
      }

      setState({
        targetUserId,
        ...next,
        isLoading: false,
        isSubmitting: false,
        error: null,
      })
    } catch (error) {
      if (requestRef.current !== requestId) {
        return
      }

      setState((current) => ({
        ...current,
        targetUserId,
        isLoading: false,
        isSubmitting: false,
        error: error.message,
      }))
    }
  }, [isValidTarget, targetUserId])

  useEffect(() => {
    refresh({ clearError: true })
  }, [refresh])

  const submit = useCallback(async () => {
    if (!isValidTarget || state.isLoading || state.isSubmitting) {
      return
    }

    if (state.status === 'friends' || state.status === 'outgoing') {
      return
    }

    const requestId = requestRef.current + 1
    requestRef.current = requestId

    setState((current) => ({
      ...current,
      targetUserId,
      isSubmitting: true,
      error: null,
    }))

    try {
      if (state.status === 'incoming' && state.request?.id) {
        await acceptFriendRequest(state.request.id)
      } else {
        await sendFriendRequest(targetUserId)
      }

      const next = await loadFriendship(targetUserId)

      if (requestRef.current !== requestId) {
        return
      }

      setState({
        targetUserId,
        ...next,
        isLoading: false,
        isSubmitting: false,
        error: null,
      })
    } catch (error) {
      if (requestRef.current !== requestId) {
        return
      }

      try {
        const next = await loadFriendship(targetUserId)

        if (requestRef.current !== requestId) {
          return
        }

        setState({
          targetUserId,
          ...next,
          isLoading: false,
          isSubmitting: false,
          error: error.message,
        })
      } catch {
        if (requestRef.current !== requestId) {
          return
        }

        setState((current) => ({
          ...current,
          targetUserId,
          isLoading: false,
          isSubmitting: false,
          error: error.message,
        }))
      }
    }
  }, [
    isValidTarget,
    state.isLoading,
    state.isSubmitting,
    state.request,
    state.status,
    targetUserId,
  ])

  return {
    ...state,
    refresh,
    submit,
  }
}

export default useFriendshipAction
