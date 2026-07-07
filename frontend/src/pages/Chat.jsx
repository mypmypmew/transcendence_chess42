import { useState } from 'react'
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
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [conversationList, setConversationList] = useState(conversations)
  const activeConversation = conversationList.find((conversation) => conversation.id === activeConversationId)
  const hasConversations = conversationList.length > 0
  function handleCloseConversation() {
    setActiveConversationId(null)
    setMessageText('')
  }
  function handleSendMessage(event) {
    event.preventDefault()
    const trimmedMessage = messageText.trim()
    if (!trimmedMessage || !activeConversation) {
      return
    }
    setConversationList((currentConversations) =>
      currentConversations.map((conversation) => {
        if (conversation.id !== activeConversation.id) {
          return conversation
        }
        return {
          ...conversation,
          lastMessage: trimmedMessage,
          messages: [
            ...conversation.messages,
            {
              id: Date.now(),
              sender: 'me',
              text: trimmedMessage,
            },
          ],
        }
      })
    )
    setMessageText('')
  }
  return (
    <AppLayout eyebrow="Messages" title="Chat">
      <div className="cm-page-grid" style={{ gridTemplateColumns: 'minmax(220px, 1fr) minmax(0, 4fr)' }}>
        <section className="cm-panel" aria-labelledby="chat-list-title">
          <div className="cm-panel-header">
            <div>
              <h2 className="cm-section-title" id="chat-list-title">Conversations</h2>
              <p className="cm-muted">Existing dialogs only</p>
            </div>
          </div>
          <div className="cm-panel-body">
            {!hasConversations && (
              <div className="empty-state">
                <i className="ti ti-message-circle" aria-hidden="true" />
                <p className="text-primary">No conversations yet</p>
                <span className="text-muted">Message someone from your friends list.</span>
              </div>
            )}
            {hasConversations && (
              <div className="cm-list">
                {conversationList.map((conversation) => (
                  <button
                    className={activeConversationId === conversation.id ? 'cm-list-row active' : 'cm-list-row'}
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                  >
                    <div className="avatar avatar-md cm-avatar-photo">
                      {conversation.contact.avatar ? (
                        <img className="cm-avatar-image" src={conversation.contact.avatar} alt="" />
                      ) : (
                        conversation.contact.nickname[0]
                      )}
                    </div>
                    <div className="min-w-0">
                      <strong className="text-primary">{conversation.contact.nickname}</strong>
                      <p className="cm-muted">{conversation.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="cm-panel cm-chat-shell" aria-labelledby="chat-active-title">
        
        </section>
      </div>
    </AppLayout>
  )
}
export default Chat