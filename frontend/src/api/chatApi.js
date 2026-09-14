import { request } from './httpClient'

function listConversations() {
  return request('/api/conversations')
}

function getMessages(conversationId) {
  return request(`/api/conversations/${conversationId}/messages`)
}

function openConversation(userId) {
  return request('/api/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  })
}

export {
  listConversations,
  getMessages,
  openConversation,
}