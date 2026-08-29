import { request } from './httpClient'

function getFriends() {
  return request('/api/friends')
}

function getFriendRequests() {
  return request('/api/friend-requests')
}

export {
  getFriendRequests,
  getFriends,
}
