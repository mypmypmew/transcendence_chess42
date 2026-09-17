const { Chess } = require('chess.js');

// Use the real persistence layer by default while allowing tests to inject a fake repository
const defaultGameRepository = require('../repositories/gameRepository');

class GameService {
  // Dependency injection keeps database access replaceable and makes unit tests independent of Prisma
  constructor({ gameRepository = defaultGameRepository } = {}) {
    this.gameRepository = gameRepository;
    this.games = new Map();
    this.pendingPlayers = new Set();
    this.pendingCompletions = new Set();
  }

  async createGame({ whiteId, blackId }) {
    if (!Number.isInteger(whiteId) || whiteId <= 0) {
      throw new TypeError('whiteId must be a positive integer');
    }

    if (!Number.isInteger(blackId) || blackId <= 0) {
      throw new TypeError('blackId must be a positive integer');
    }

    if (whiteId === blackId) {
      throw new Error('White and black players must be different users');
    }

    for (const playerId of [whiteId, blackId]) {
      if (this.isPlayerBusy(playerId)) {
        throw new Error('Player already has an active or pending game');
      }
    }

    // Reserve both players before the asynchronous database operation.
    this.pendingPlayers.add(whiteId);
    this.pendingPlayers.add(blackId);

    try {
      // Create the database record before storing the active game in memory.
      // Prisma generates the permanent numeric ID shared by the database,
      // Socket.IO events and frontend routes.
      const persistedGame = await this.gameRepository.createGame({
        whiteId,
        blackId,
      });

      const game = {
        // Use Prisma's ID instead of generating a separate in-memory UUID.
        // This prevents the same game from having two unrelated identifiers.
        gameId: persistedGame.id,
        whiteId,
        blackId,
        chess: new Chess(),
        status: 'IN_PROGRESS',
        result: null,
        winnerId: null,
      };

      this.games.set(game.gameId, game);

      return this.toSnapshot(game);
    } finally {
      // Release reservations after success or failure.
      this.pendingPlayers.delete(whiteId);
      this.pendingPlayers.delete(blackId);
    }

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
    // Prisma generates positive integer IDs for Game records.
    // Validate the ID before using it as a key in the active games map.
    if (!Number.isInteger(gameId) || gameId <= 0) {
      throw new TypeError('gameId must be a positive integer');
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

  getActiveGame(playerId) {
    if (!Number.isInteger(playerId) || playerId <= 0) {
      throw new TypeError('playerId must be a positive integer');
    }

    for (const game of this.games.values()) {
      if (game.status === 'IN_PROGRESS' &&
        (game.whiteId === playerId || game.blackId === playerId)
      ) {
        return this.toSnapshot(game);
      }
    }

    return null;
  }

  isPlayerBusy(playerId) {
    return this.getActiveGame(playerId) !== null ||
      this.pendingPlayers.has(playerId);
  }

  async makeMove({ gameId, playerId, from, to, promotion = 'q' }) {
    const game = this._getGameOrThrow(gameId);

    if (this.pendingCompletions.has(gameId)) {
      throw new Error('Game completion is being saved; retry');
    }

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

    // Copy the full history so repetition detection remains available.
    const chess = new Chess();
    chess.loadPgn(game.chess.pgn());
    const updatedGame = { ...game, chess };

    let move;

    try {
      move = updatedGame.chess.move({
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

    this._updateGameResult(updatedGame);

    // Persist only when the accepted move completes the game.
    // Normal in-progress moves remain in memory and do not write to the database.
    if (updatedGame.status === 'COMPLETED') {
      this.pendingCompletions.add(gameId);

      try {
        await this.gameRepository.finishGame(gameId, {
          result: updatedGame.result,
          pgn: updatedGame.chess.pgn(),
        });

        // Publish the final position only after persistence succeeds.
        this.games.set(gameId, updatedGame);
        return this.toSnapshot(updatedGame);
      } finally {
        this.pendingCompletions.delete(gameId);
      }
    }

    // Ordinary moves remain in memory without a database write.
    this.games.set(gameId, updatedGame);
    return this.toSnapshot(updatedGame);
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

  async resignGame({ gameId, playerId }) {
    const game = this._getGameOrThrow(gameId);

    if (this.pendingCompletions.has(gameId)) {
      throw new Error('Game completion is being saved; retry');
    }

    if (game.status !== 'IN_PROGRESS') {
      throw new Error('Game is already completed');
    }

    if (!Number.isInteger(playerId) || playerId <= 0) {
      throw new TypeError('playerId must be a positive integer');
    }

    if (playerId !== game.whiteId && playerId !== game.blackId) {
      throw new Error('Player is not part of this game');
    }

    // Prepare completion without changing the publicly available state.
    const chess = new Chess();
    chess.loadPgn(game.chess.pgn());

    const whiteResigned = playerId === game.whiteId;
    chess.setHeader('Result', whiteResigned ? '0-1' : '1-0');

    const completed = {
      ...game,
      chess,
      status: 'COMPLETED',
      result: whiteResigned ? 'BLACK_WIN' : 'WHITE_WIN',
      winnerId: whiteResigned ? game.blackId : game.whiteId,
    };

    this.pendingCompletions.add(gameId);

    try {
      await this.gameRepository.finishGame(gameId, {
        result: completed.result,
        pgn: completed.chess.pgn(),
      });

      this.games.set(gameId, completed);
      return this.toSnapshot(completed);
    } finally {
      this.pendingCompletions.delete(gameId);
    }
  }
}

module.exports = {
  GameService,
};
