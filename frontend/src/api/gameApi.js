import { request } from './httpClient'

function getGames() {
  return request('/api/games')
}

export {
  getGames,
}
