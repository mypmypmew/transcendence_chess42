const { randomUUID } = require('node:crypto');
const { Chess } = require('chess.js');

class GameService {
  constructor() {
    this.games = new Map();
  }

  createGame({ whiteId, blackId }) {
    if (!Number.isInteger(whiteId) || whiteId <= 0) {
      throw new TypeError('whiteId must be a positive integer');
    }

    if (!Number.isInteger(blackId) || blackId <= 0) {
      throw new TypeError('blackId must be a positive integer');
    }

    if (whiteId === blackId) {
      throw new Error('White and black players must be different users');
    }

    const gameId = randomUUID();

    const game = {
      gameId,
      whiteId,
      blackId,
      chess: new Chess(),
      status: 'IN_PROGRESS',
      result: null,
      winnerId: null,
    };

    this.games.set(gameId, game);

    return this.toSnapshot(game);
  }

  toSnapshot(game) {
    return {
      gameId: game.gameId,
      whiteId: game.whiteId,
      blackId: game.blackId,
      fen: game.chess.fen(),
      turn: game.chess.turn(),
      status: game.status,
      result: game.result,
      winnerId: game.winnerId,
      pgn: game.chess.pgn(),
    };
  }
}

module.exports = {
  GameService,
};