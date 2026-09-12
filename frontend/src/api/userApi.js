import { request } from './httpClient'

function searchUsers(search) {
  return request(`/api/users?search=${encodeURIComponent(search)}`)
}

// Load the global leaderboard through the shared HTTP client.
function getLeaderboard() {
  return request('/api/users/leaderboard')
}

export {
  searchUsers,
  getLeaderboard,
}
