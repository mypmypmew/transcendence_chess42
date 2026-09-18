import { request } from './httpClient'

function getGames() {
  return request('/api/games')
}

function getActiveGame() {
  return request('/api/games/active')
}

function getGame(gameId) {
  // Load participant details separately from the real-time chess state.
  return request(`/api/games/${gameId}`)
}

export {
  getActiveGame,
  getGame,
  getGames,
}
