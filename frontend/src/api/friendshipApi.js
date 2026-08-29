import { request } from './httpClient'

function getFriends() {
  return request('/api/friends')
}

function getFriendRequests() {
  return request('/api/friend-requests')
}

function sendFriendRequest(recipientId) {
  return request('/api/friend-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipientId }),
  })
}

export {
  getFriendRequests,
  getFriends,
  sendFriendRequest,
}
