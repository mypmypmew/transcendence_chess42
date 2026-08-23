const gameRepository = require('../repositories/gameRepository');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function toGameSummary(game) {
  return {
    id: game.id,
    status: game.status,
    result: game.result,
    winnerId: game.winnerId,
    createdAt: game.createdAt,
    endedAt: game.endedAt,
    white: game.white,
    black: game.black,
  };
}

function toGameDetail(game) {
  return {
    ...toGameSummary(game),
    pgn: game.pgn,
  };
}

async function listGames(userId) {
  const games = await gameRepository.findGamesByUserId(userId);
  return games.map(toGameSummary);
}

async function getGame(userId, gameId) {
  if (!Number.isInteger(gameId) || gameId <= 0) {
    throw httpError(404, 'Game not found');
  }

  const game = await gameRepository.findGameById(gameId);

  if (!game || (game.whiteId !== userId && game.blackId !== userId)) {
    throw httpError(404, 'Game not found');
  }

  return toGameDetail(game);
}

module.exports = {
  listGames,
  getGame,
  toGameSummary,
  toGameDetail,
};