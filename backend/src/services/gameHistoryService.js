const gameRepository = require('../repositories/gameRepository');

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function toPublicPlayer(player) {
  return {
    id: player.id,
    username: player.username,
    rating: player.rating,
  }
};

function toGameSummary(game) {
  return {
    id: game.id,
    status: game.status,
    result: game.result,
    winnerId: game.winnerId,
    createdAt: game.createdAt,
    endedAt: game.endedAt,
    white: toPublicPlayer(game.white),
    black: toPublicPlayer(game.black),
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
    throw httpError(400, 'gameId must be a positive integer');
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