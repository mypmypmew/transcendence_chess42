import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { openConversation } from '../api/chatApi.js'
import { useAuth } from '../context/AuthContext.jsx'

function getBackendUserId(user) {
  return Number.isInteger(user?.id) && user.id > 0 ? user.id : null
}

function getOpenConversationError(recipient, currentUser) {
  const recipientId = getBackendUserId(recipient)

  if (!recipientId) {
    return 'This user is not available for messaging.'
  }

  if (recipientId === currentUser?.id) {
    return 'You cannot message yourself.'
  }

  return null
}

function useOpenConversation() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const openingRecipientRef = useRef(null)
  const openingPromiseRef = useRef(null)
  const [openingRecipientId, setOpeningRecipientId] = useState(null)
  const [openConversationError, setOpenConversationError] = useState(null)

  const startConversation = useCallback(async (recipient, options = {}) => {
    const validationError = getOpenConversationError(recipient, user)

    if (validationError) {
      setOpenConversationError(validationError)
      throw new Error(validationError)
    }

    const recipientId = recipient.id

    if (openingRecipientRef.current === recipientId && openingPromiseRef.current) {
      return openingPromiseRef.current
    }

    openingRecipientRef.current = recipientId
    setOpeningRecipientId(recipientId)
    setOpenConversationError(null)

    const openingPromise = (async () => {
      const data = await openConversation(recipientId)
      const conversationId = data?.conversation?.id

      if (!Number.isInteger(conversationId) || conversationId <= 0) {
        throw new Error('Could not open this conversation.')
      }

      options.onSuccess?.(data.conversation)
      navigate(`/chat?conversationId=${conversationId}`)
      return data.conversation
    })()

    openingPromiseRef.current = openingPromise

    try {
      return await openingPromise
    } catch (error) {
      const message = error.message || 'Could not open this conversation.'
      setOpenConversationError(message)
      throw new Error(message, { cause: error })
    } finally {
      openingRecipientRef.current = null
      openingPromiseRef.current = null
      setOpeningRecipientId(null)
    }
  }, [navigate, user])

  const clearOpenConversationError = useCallback(() => {
    setOpenConversationError(null)
  }, [])

  return {
    clearOpenConversationError,
    openConversationError,
    openingRecipientId,
    startConversation,
  }
}

export {
  getBackendUserId,
  getOpenConversationError,
  useOpenConversation,
}
