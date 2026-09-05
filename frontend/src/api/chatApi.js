const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const CHAT_URL = `${API_URL}/api/conversations`

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
  const response = await fetch(`${CHAT_URL}${path}`, {
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

function listConversations() {
  return request('')
}

export {
  listConversations,
}