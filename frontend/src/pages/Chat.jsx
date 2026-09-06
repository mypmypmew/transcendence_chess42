import { useEffect, useState } from 'react'
import { getMessages, listConversations } from '../api/chatApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useSocket } from '../context/SocketContext.jsx'
import Avatar from '../components/Avatar.jsx'
import AppLayout from '../components/AppLayout.jsx'


const conversations = [
  {
    id: 1,
    contact: {
      nickname: 'Serhii',
      avatar: null,
      status: 'online',
    },
    lastMessage: 'Ready for a rematch?',
    messages: [
      { id: 1, sender: 'contact', text: 'Good game!' },
      { id: 2, sender: 'me', text: 'Thanks, that endgame was close.' },
      { id: 3, sender: 'contact', text: 'Ready for a rematch?' },
    ],
  },
  {
    id: 2,
    contact: {
      nickname: 'Taulant',
      avatar: null,
      status: 'offline',
    },
    lastMessage: 'Let’s play later today.',
    messages: [
      { id: 1, sender: 'contact', text: 'Let’s play later today.' },
      { id: 2, sender: 'me', text: 'Sure, send me a challenge when you are online.' },
    ],
  },
  {
    id: 3,
    contact: {
      nickname: 'Tatiana',
      avatar: null,
      status: 'online',
    },
    lastMessage: 'Nice tactic in the middle game.',
    messages: [
      { id: 1, sender: 'contact', text: 'Nice tactic in the middle game.' },
      { id: 2, sender: 'me', text: 'Thank you, I almost missed it.' },
    ],
  },
  {
    id: 4,
    contact: {
      nickname: 'Alima',
      avatar: null,
      status: 'offline',
    },
    lastMessage: 'See you in the lobby.',
    messages: [
      { id: 1, sender: 'contact', text: 'See you in the lobby.' },
    ],
  },
]
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
  }, [activeConversationId])

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
        if (reply.error) {
          setLoadError(reply.error)
        }
      },
    )

    setMessageText('')
  }
  return (
    <AppLayout eyebrow="Messages" title="Chat">
		<div className="cm-page-grid chat">
        <section className="cm-panel" aria-labelledby="chat-list-title">
          <div className="cm-panel-header">
            <div>
              <h2 className="cm-section-title" id="chat-list-title">Conversations</h2>
              <p className="cm-muted">Existing dialogs only</p>
            </div>
          </div>
          <div className="cm-panel-body">
            {isLoading && (
              <div className="empty-state">
                <p className="text-primary">Loading conversations...</p>
              </div>
            )}
            {!isLoading && loadError && (
              <div className="empty-state">
                <p className="text-primary">Could not load conversations</p>
                <span className="text-muted">{loadError}</span>
              </div>
            )}
            {!isLoading && !loadError && !hasConversations && (
              <div className="empty-state">
                <i className="ti ti-message-circle" aria-hidden="true" />
                <p className="text-primary">No conversations yet</p>
                <span className="text-muted">Message someone from your friends list.</span>
              </div>
            )}
            {!isLoading && !loadError && hasConversations && (
              <div className="cm-list">
                {conversationList.map((conversation) => (
                  <button
                    className={activeConversationId === conversation.id ? 'cm-list-row active' : 'cm-list-row'}
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                  >
                    <Avatar avatar={null} name={conversation.user.username} className="avatar avatar-md" />
                    <div className="min-w-0">
                      <strong className="text-primary">{conversation.user.username}</strong>
                      <p className="cm-muted">Rating {conversation.user.rating}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="cm-panel cm-chat-shell" aria-labelledby="chat-active-title">
          {!activeConversation && (
            <div className="cm-panel-body">
              <div className="empty-state">
                <i className="ti ti-message" aria-hidden="true" />
                <p className="text-primary">Select a conversation</p>
                <span className="text-muted">Choose a dialog from the left side.</span>
              </div>
            </div>
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
                <button className="btn btn-ghost btn-icon" type="button" aria-label="Close conversation" onClick={handleCloseConversation}>
                  <i className="ti ti-x" aria-hidden="true" />
                </button>
              </div>
              <div className="cm-panel-body">
                <div className="cm-message-list">
                  {messages.map((message) => (
                    <div className={message.senderId === user.id ? 'cm-message mine' : 'cm-message'} key={message.id}>
                      {message.body}
                    </div>
                  ))}
                </div>
              </div>
              <form className="cm-panel-body flex gap-3" onSubmit={handleSendMessage}>
                <input
                  className="input flex-1"
                  type="text"
                  value={messageText}
                  placeholder="Write a message..."
                  aria-label="Message text"
                  onChange={(event) => setMessageText(event.target.value)}
                />
                <button className="btn btn-primary" type="submit" disabled={!messageText.trim()}>
                  Send
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
export default Chat