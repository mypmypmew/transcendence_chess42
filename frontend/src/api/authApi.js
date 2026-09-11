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

function getCurrentUser() {
  return request('/api/auth/me')
}

export {
  getCurrentUser,
  login,
  logout,
  register,
}
