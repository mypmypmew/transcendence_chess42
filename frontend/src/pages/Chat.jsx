import { useEffect, useState } from 'react'
import { getMessages, listConversations } from '../api/chatApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useSocket } from '../context/SocketContext.jsx'
import Avatar from '../components/Avatar.jsx'
import AppLayout from '../components/AppLayout.jsx'
import {
  Button,
  EmptyState,
  IconButton,
  Input,
  ListRow,
  MessageBubble,
  Panel,
  PanelBody,
  PanelHeader,
} from '../components/ui.jsx'

function Chat() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [conversationList, setConversationList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [messages, setMessages] = useState([])
  const activeConversation = conversationList.find((conversation) => conversation.id === activeConversationId)
  const hasConversations = conversationList.length > 0

  useEffect(() => {
    let cancelled = false

    async function loadConversations() {
      try {
        const data = await listConversations()
        if (!cancelled) {
          setConversationList(data.conversations)
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadConversations()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([])
      return
    }

    socket.emit('chat:join', activeConversationId, () => {})

    let cancelled = false

    async function loadMessages() {
      try {
        const data = await getMessages(activeConversationId)
        if (!cancelled) {
          setMessages(data.messages)
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message)
        }
      }
    }

    loadMessages()

    return () => {
      cancelled = true
    }
  }, [socket, activeConversationId])

  useEffect(() => {
    function handleIncomingMessage(message) {
      if (message.conversationId !== activeConversationId) {
        return
      }
      setMessages((current) => [...current, message])
    }

    socket.on('chat:message', handleIncomingMessage)

    return () => {
      socket.off('chat:message', handleIncomingMessage)
    }
  }, [socket, activeConversationId])

  useEffect(() => {
    function handleReconnect() {
      if (!activeConversationId) {
        return
      }
      socket.emit('chat:join', activeConversationId, () => {})
      getMessages(activeConversationId)
        .then((data) => setMessages(data.messages))
        .catch((error) => setLoadError(error.message))
    }

    socket.on('connect', handleReconnect)

    return () => {
      socket.off('connect', handleReconnect)
    }
  }, [socket, activeConversationId])

  function handleCloseConversation() {
    setActiveConversationId(null)
    setMessageText('')
  }

  function handleSendMessage(event) {
    event.preventDefault()
    const trimmedMessage = messageText.trim()
    if (!trimmedMessage || !activeConversationId) {
      return
    }

    socket.emit(
      'chat:message',
      { conversationId: activeConversationId, body: trimmedMessage },
      (reply) => {
        if (reply?.error) {
          setLoadError(reply.error)
        }
      },
    )

    setMessageText('')
  }

  return (
    <AppLayout eyebrow="Messages" title="Chat" showLegalFooter={false}>
      <div className="cm-page-grid chat">
        <Panel aria-labelledby="chat-list-title">
          <PanelHeader title="Conversations" titleId="chat-list-title">
            <p className="cm-muted">Existing dialogs only</p>
          </PanelHeader>
          <PanelBody>
            {isLoading && (
              <EmptyState
                icon="message-circle"
                title="Loading conversations..."
              />
            )}
            {!isLoading && loadError && (
              <EmptyState
                icon="message-circle"
                title="Could not load conversations"
                subtitle={loadError}
              />
            )}
            {!isLoading && !loadError && !hasConversations && (
              <EmptyState
                icon="message-circle"
                title="No conversations yet"
                subtitle="Message someone from your friends list."
              />
            )}
            {!isLoading && !loadError && hasConversations && (
              <div className="cm-list">
                {conversationList.map((conversation) => (
                  <ListRow
                    as="button"
                    className={activeConversationId === conversation.id ? 'active' : ''}
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                  >
                    <Avatar avatar={null} name={conversation.user.username} className="avatar avatar-md" />
                    <div className="min-w-0">
                      <strong className="text-primary">{conversation.user.username}</strong>
                      <p className="cm-muted">Rating {conversation.user.rating}</p>
                    </div>
                  </ListRow>
                ))}
              </div>
            )}
          </PanelBody>
        </Panel>
        <Panel className="cm-chat-shell" aria-labelledby="chat-active-title">
          {!activeConversation && (
            <PanelBody>
              <EmptyState
                icon="message"
                title="Select a conversation"
                subtitle="Choose a dialog from the left side."
              />
            </PanelBody>
          )}
          {activeConversation && (
            <>
              <div className="cm-panel-header">
                <div className="flex items-center gap-3">
                  <Avatar avatar={null} name={activeConversation.user.username} className="avatar avatar-md" />
                  <div>
                    <h2 className="cm-section-title" id="chat-active-title">{activeConversation.user.username}</h2>
                    <p className="cm-muted">Rating {activeConversation.user.rating}</p>
                  </div>
                </div>
                <IconButton aria-label="Close conversation" icon="x" onClick={handleCloseConversation} />
              </div>
              <PanelBody>
                <div className="cm-message-list">
                  {messages.map((message) => (
                    <MessageBubble isMine={message.senderId === user.id} key={message.id}>
                      {message.body}
                    </MessageBubble>
                  ))}
                </div>
              </PanelBody>
              <PanelBody as="form" className="flex gap-3" onSubmit={handleSendMessage}>
                <Input
                  className="flex-1"
                  type="text"
                  value={messageText}
                  placeholder="Write a message..."
                  aria-label="Message text"
                  onChange={(event) => setMessageText(event.target.value)}
                />
                <Button type="submit" disabled={!messageText.trim()}>
                  Send
                </Button>
              </PanelBody>
            </>
          )}
        </Panel>
      </div>
    </AppLayout>
  )
}

export default Chat