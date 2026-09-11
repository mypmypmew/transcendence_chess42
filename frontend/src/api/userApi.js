import { request } from './httpClient'

function searchUsers(search) {
  return request(`/api/users?search=${encodeURIComponent(search)}`)
}

export {
  searchUsers,
}
