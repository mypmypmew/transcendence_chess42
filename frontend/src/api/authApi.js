const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const AUTH_URL = `${API_URL}/api/auth`

async function parseJsonResponse(response) {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return null
  }

  return response.json()
}

async function request(path, options = {}) {
  const response = await fetch(`${AUTH_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...options.headers,
    },
  })
  const data = await parseJsonResponse(response)

  if (!response.ok) {
    const error = new Error(data?.error || 'Request failed')
    error.status = response.status
    throw error
  }

  return data
}

function register({ username, email, password }) {
  return request('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  })
}

function login({ email, password }) {
  return request('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })
}

function logout() {
  return request('/logout', {
    method: 'POST',
  })
}

function getCurrentUser() {
  return request('/me')
}

export {
  getCurrentUser,
  login,
  logout,
  register,
}
