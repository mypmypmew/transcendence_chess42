import { request } from './httpClient'

function searchUsers(search) {
  return request(`/api/users?search=${encodeURIComponent(search)}`)
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
  searchUsers,
  sendFriendRequest,
}
