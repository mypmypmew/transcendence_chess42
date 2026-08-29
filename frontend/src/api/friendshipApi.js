import { request } from './httpClient'

function getFriends() {
  return request('/api/friends')
}

export {
  getFriends,
}
