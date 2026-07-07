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
                  <div className="avatar avatar-md cm-avatar-photo">
                    {activeConversation.contact.avatar ? (
                      <img className="cm-avatar-image" src={activeConversation.contact.avatar} alt="" />
                    ) : (
                      activeConversation.contact.nickname[0]
                    )}
                  </div>
                  <div>
                    <h2 className="cm-section-title" id="chat-active-title">{activeConversation.contact.nickname}</h2>
                    <p className="cm-muted">{activeConversation.contact.status}</p>
                  </div>
                </div>
                <button className="btn btn-ghost btn-icon" type="button" aria-label="Close conversation" onClick={handleCloseConversation}>
                  <i className="ti ti-x" aria-hidden="true" />
                </button>
              </div>
              <div className="cm-panel-body">
                <div className="cm-message-list">
                  {activeConversation.messages.map((message) => (
                    <div className={message.sender === 'me' ? 'cm-message mine' : 'cm-message'} key={message.id}>
                      {message.text}
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