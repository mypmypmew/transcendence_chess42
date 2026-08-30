import { useState } from 'react'
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
    <AppLayout eyebrow="Messages" title="Chat" showLegalFooter={false}>
		<div className="cm-page-grid chat">
        <Panel aria-labelledby="chat-list-title">
          <PanelHeader title="Conversations" titleId="chat-list-title">
            <p className="cm-muted">Existing dialogs only</p>
          </PanelHeader>
          <PanelBody>
            {!hasConversations && (
              <EmptyState
                icon="message-circle"
                title="No conversations yet"
                subtitle="Message someone from your friends list."
              />
            )}
            {hasConversations && (
              <div className="cm-list">
                {conversationList.map((conversation) => (
                  <ListRow
                    as="button"
                    className={activeConversationId === conversation.id ? 'active' : ''}
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                  >
                    <Avatar avatar={conversation.contact.avatar} name={conversation.contact.nickname} className="avatar avatar-md" />
                    <div className="min-w-0">
                      <strong className="text-primary">{conversation.contact.nickname}</strong>
                      <p className="cm-muted">{conversation.lastMessage}</p>
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
                  <Avatar avatar={activeConversation.contact.avatar} name={activeConversation.contact.nickname} className="avatar avatar-md" />
                  <div>
                    <h2 className="cm-section-title" id="chat-active-title">{activeConversation.contact.nickname}</h2>
                    <p className="cm-muted">{activeConversation.contact.status}</p>
                  </div>
                </div>
                <IconButton aria-label="Close conversation" icon="x" onClick={handleCloseConversation} />
              </div>
              <PanelBody>
                <div className="cm-message-list">
                  {activeConversation.messages.map((message) => (
                    <MessageBubble isMine={message.sender === 'me'} key={message.id}>
                      {message.text}
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
