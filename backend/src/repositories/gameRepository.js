const {
  GameResult,
  GameStatus,
} = require('@prisma/client');

const prisma = require('../db/prisma');
const { getGamePoints } = require('../services/gamePoints');

function validatePositiveInteger(value, fieldName) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${fieldName} must be a positive integer`);
  }
}

const PUBLIC_PLAYER_SELECT = {
  select: {
    id: true,
    username: true,
    rating: true,
  },
};

async function findGameById(gameId) {
  validatePositiveInteger(gameId, 'gameId');

  return prisma.game.findUnique({
    where: { id: gameId },
    include: {
      white: PUBLIC_PLAYER_SELECT,
      black: PUBLIC_PLAYER_SELECT,
    },
  });
}

async function findGamesByUserId(userId) {
  validatePositiveInteger(userId, 'userId');

  return prisma.game.findMany({
    where: {
      OR: [
        { whiteId: userId },
        { blackId: userId },
      ],
    },
    include: {
      white: PUBLIC_PLAYER_SELECT,
      black: PUBLIC_PLAYER_SELECT,
    },
    orderBy: { createdAt: 'desc' },
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
  const points = getGamePoints(result);

  return prisma.$transaction(async (tx) => {
    const game = await tx.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    // A retry with the same result must not award points again.
    if (game.status === GameStatus.COMPLETED) {
      if (game.result !== result) {
        throw new Error('Game already completed with a different result');
      }

      return game;
    }

    if (game.status !== GameStatus.IN_PROGRESS) {
      throw new Error('Only an in-progress game can be finished');
    }

    const winnerId = result === GameResult.WHITE_WIN
      ? game.whiteId
      : result === GameResult.BLACK_WIN
        ? game.blackId
        : null;

    // Only the request that completes the game may award points.
    const updated = await tx.game.updateMany({
      where: {
        id: gameId,
        status: GameStatus.IN_PROGRESS,
      },
      data: {
        status: GameStatus.COMPLETED,
        result,
        winnerId,
        pgn,
        endedAt: new Date(),
      },
    });

    if (updated.count !== 1) {
      throw new Error('Game completion changed concurrently; retry');
    }

    if (points.white > 0) {
      await tx.user.update({
        where: { id: game.whiteId },
        data: { rating: { increment: points.white }},
      });
    }

    if (points.black > 0) {
      await tx.user.update({
        where: { id: game.blackId },
        data: { rating: { increment: points.black }},
      });
    }

    return tx.game.findUnique({
      where: { id: gameId },
    });
  });
}

// Cancel games whose in-memory state was lost after a backend restart.
// Call only during startup, before accepting requests or socket connections.
async function cancelInterruptedGames() {
  return prisma.game.updateMany({
    where: {
      status: GameStatus.IN_PROGRESS,
    },
    data: {
      status: GameStatus.CANCELLED,
      result: null,
      winnerId: null,
      endedAt: new Date(),
    },
  });
}

module.exports = {
  findGameById,
  findGamesByUserId,
  createGame,
  finishGame,
  cancelInterruptedGames,
};
