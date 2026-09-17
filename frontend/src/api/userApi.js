import { request } from './httpClient'

function searchUsers(search) {
  return request(`/api/users?search=${encodeURIComponent(search)}`)
}

// Load the global leaderboard through the shared HTTP client.
function getLeaderboard() {
  return request('/api/users/leaderboard')
}

function updateCurrentUser({ username, email }) {
  return request('/api/users/me', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email }),
  })
}

export {
  searchUsers,
  getLeaderboard,
  updateCurrentUser,
}
