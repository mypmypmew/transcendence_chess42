import { request } from './httpClient'

function getGames() {
  return request('/api/games')
}

function getGame(gameId) {
  // Load participant details separately from the real-time chess state.
  return request(`/api/games/${gameId}`)
}

export {
  getGame,
  getGames,
}
