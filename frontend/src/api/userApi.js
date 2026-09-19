import { request } from './httpClient'

function searchUsers(search) {
  return request(`/api/users?search=${encodeURIComponent(search)}`)
}

// Load the global leaderboard through the shared HTTP client.
async function getLeaderboard({ signal } = {}) {
  const data = await request('/api/users/leaderboard', { signal })

  if (
    !Array.isArray(data?.players)
    || data.players.some((player) => (
      !Number.isInteger(player?.rating)
      || player.rating < 0
    ))
  ) {
    throw new Error('Invalid leaderboard response')
  }

  return data
}

function getPlayerGames(playerId, { signal } = {}) {
  return request(`/api/users/${playerId}/games`, { signal })
}

async function getPublicProfile(playerId, { signal } = {}) {
  if (!Number.isSafeInteger(playerId) || playerId <= 0) {
    throw new Error('Invalid player ID')
  }

  const data = await request(`/api/users/${playerId}`, { signal })

  if (
    data?.user?.id !== playerId
    || !Number.isInteger(data.user.rating)
    || data.user.rating < 0
  ) {
    throw new Error('Invalid player profile response')
  }

  return data.user
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

function uploadCurrentUserAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)

  return request('/api/users/me/avatar', {
    method: 'POST',
    body: formData,
  })
}

export {
  searchUsers,
  getLeaderboard,
  getPlayerGames,
  getPublicProfile,
  updateCurrentUser,
  uploadCurrentUserAvatar,
}
