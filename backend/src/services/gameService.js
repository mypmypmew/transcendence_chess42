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

    _getGameOrThrow(gameId) {
    if (typeof gameId !== 'string' || gameId.trim() === '') {
      throw new TypeError('gameId must be a non-empty string');
    }

    const game = this.games.get(gameId);

    if (!game) {
      throw new Error('Game not found');
    }

    return game;
  }

  getGame(gameId) {
    const game = this._getGameOrThrow(gameId);

    return this.toSnapshot(game);
  }

    makeMove({ gameId, playerId, from, to, promotion = 'q' }) {
    const game = this._getGameOrThrow(gameId);

    if (game.status !== 'IN_PROGRESS') {
      throw new Error('Game is already completed');
    }

    if (!Number.isInteger(playerId) || playerId <= 0) {
      throw new TypeError('playerId must be a positive integer');
    }

    let playerColor;

    if (playerId === game.whiteId) {
      playerColor = 'w';
    } else if (playerId === game.blackId) {
      playerColor = 'b';
    } else {
      throw new Error('Player is not part of this game');
    }

    if (game.chess.turn() !== playerColor) {
      throw new Error('It is not this player’s turn');
    }

    if (!['q', 'r', 'b', 'n'].includes(promotion)) {
      throw new TypeError('Invalid promotion piece');
    }

    let move;

    try {
      move = game.chess.move({
        from,
        to,
        promotion,
      });
    } catch {
      throw new Error('Illegal move');
    }

    if (!move) {
      throw new Error('Illegal move');
    }

    this._updateGameResult(game);

    return this.toSnapshot(game);
  }

      _updateGameResult(game) {
    if (game.chess.isCheckmate()) {
      game.status = 'COMPLETED';

      if (game.chess.turn() === 'w') {
        game.result = 'BLACK_WIN';
        game.winnerId = game.blackId;
        game.chess.setHeader('Result', '0-1');
      } else {
        game.result = 'WHITE_WIN';
        game.winnerId = game.whiteId;
        game.chess.setHeader('Result', '1-0');
      }

      return;
    }

    if (game.chess.isDraw()) {
      game.status = 'COMPLETED';
      game.result = 'DRAW';
      game.winnerId = null;
      game.chess.setHeader('Result', '1/2-1/2');
    }
  }

    resignGame({ gameId, playerId }) {
    const game = this._getGameOrThrow(gameId);

    if (game.status !== 'IN_PROGRESS') {
      throw new Error('Game is already completed');
    }

    if (!Number.isInteger(playerId) || playerId <= 0) {
      throw new TypeError('playerId must be a positive integer');
    }

    if (playerId === game.whiteId) {
      game.status = 'COMPLETED';
      game.result = 'BLACK_WIN';
      game.winnerId = game.blackId;
      game.chess.setHeader('Result', '0-1');
    } else if (playerId === game.blackId) {
      game.status = 'COMPLETED';
      game.result = 'WHITE_WIN';
      game.winnerId = game.whiteId;
      game.chess.setHeader('Result', '1-0');
    } else {
      throw new Error('Player is not part of this game');
    }

    return this.toSnapshot(game);
  }
}

module.exports = {
  GameService,
};