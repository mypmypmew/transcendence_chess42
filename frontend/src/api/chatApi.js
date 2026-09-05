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