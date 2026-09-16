const gameRepository = require('../repositories/gameRepository');
const userRepository = require('../repositories/userRepository');

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

async function listPlayerGames(playerId) {
  if (!Number.isSafeInteger(playerId) || playerId <= 0) {
    throw httpError(400, 'playerId must be a positive integer');
  }

  const player = await userRepository.findPublicUserById(playerId);

  if (!player) {
    throw httpError(404, 'Player not found');
  }

  return listGames(playerId);
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
  listPlayerGames,
  getGame,
  toGameSummary,
  toGameDetail,
};
