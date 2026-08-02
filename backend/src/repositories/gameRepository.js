const {
  GameResult,
  GameStatus,
} = require('@prisma/client');

const prisma = require('../db/prisma');

function validatePositiveInteger(value, fieldName) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${fieldName} must be a positive integer`);
  }
}

async function findGameById(gameId) {
  validatePositiveInteger(gameId, 'gameId');

  return prisma.game.findUnique({
    where: { id: gameId },
  });
}

async function createGame({ whiteId, blackId }) {
  validatePositiveInteger(whiteId, 'whiteId');
  validatePositiveInteger(blackId, 'blackId');

  if (whiteId === blackId) {
    throw new Error('White and black players must be different users');
  }

  return prisma.game.create({
    data: {
      whiteId,
      blackId,
    },
  });
}

async function finishGame(gameId, { result, pgn = null }) {
  validatePositiveInteger(gameId, 'gameId');

  if (!Object.values(GameResult).includes(result)) {
    throw new TypeError('Invalid game result');
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    throw new Error('Game not found');
  }

  if (game.status !== GameStatus.IN_PROGRESS) {
    throw new Error('Only an in-progress game can be finished');
  }

  let winnerId = null;

  if (result === GameResult.WHITE_WIN) {
    winnerId = game.whiteId;
  }

  if (result === GameResult.BLACK_WIN) {
    winnerId = game.blackId;
  }

  return prisma.game.update({
    where: { id: gameId },
    data: {
      status: GameStatus.COMPLETED,
      result,
      winnerId,
      pgn,
      endedAt: new Date(),
    },
  });
}

module.exports = {
  findGameById,
  createGame,
  finishGame,
};