import { request } from './httpClient'

function register({ username, email, password }) {
  return request('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  })
}

function login({ email, password }) {
  return request('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
}

function logout() {
  return request('/api/auth/logout', {
    method: 'POST',
  })
}

function getCurrentUser({ signal } = {}) {
  return request('/api/auth/me', {signal})
}

async function getCurrentRating(options) {
  const data = await getCurrentUser(options)

  if (
    !Number.isInteger(data?.user?.rating)
    || data.user.rating < 0
  ) {
    throw new Error('Invalid rating response')
  }

  return {
    userId: data.user.id,
    rating: data.user.rating,
  }
}

export {
  getCurrentUser,
  getCurrentRating,
  login,
  logout,
  register,
}
