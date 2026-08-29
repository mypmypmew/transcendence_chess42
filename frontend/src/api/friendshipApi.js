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

function acceptFriendRequest(requestId) {
  return request(`/api/friend-requests/${requestId}/accept`, {
    method: 'POST',
  })
}

function deleteFriendRequest(requestId) {
  return request(`/api/friend-requests/${requestId}`, {
    method: 'DELETE',
  })
}

function removeFriend(friendUserId) {
  return request(`/api/friends/${friendUserId}`, {
    method: 'DELETE',
  })
}

export {
  acceptFriendRequest,
  deleteFriendRequest,
  getFriendRequests,
  getFriends,
  removeFriend,
  sendFriendRequest,
}
