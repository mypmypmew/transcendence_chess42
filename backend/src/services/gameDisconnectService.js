const DEFAULT_GAME_DISCONNECT_TIMEOUT_MS = 30_000;

class GameDisconnectService {
  constructor({
    io,
    gameService,
    presenceService,
    timeoutMs = DEFAULT_GAME_DISCONNECT_TIMEOUT_MS,
  } = {}) {
    if (!io || typeof io.to !== 'function') {
      throw new TypeError('io with a to method is required');
    }

    if (
      !gameService ||
      typeof gameService.getActiveGame !== 'function' ||
      typeof gameService.resignGame !== 'function'
    ) {
      throw new TypeError(
        'gameService with getActiveGame and resignGame methods is required',
      );
    }

    if (
      !presenceService ||
      typeof presenceService.isOnline !== 'function'
    ) {
      throw new TypeError('presenceService with isOnline method is required');
    }

    if (!Number.isInteger(timeoutMs) || timeoutMs < 0) {
      throw new TypeError('timeoutMs must be a non-negative integer');
    }

    this.io = io;
    this.gameService = gameService;
    this.presenceService = presenceService;
    this.timeoutMs = timeoutMs;
    this.disconnectTimers = new Map();
  }

  handlePresenceChange({ userId, online } = {}) {
    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      typeof online !== 'boolean'
    ) {
      return;
    }

    const game = this.gameService.getActiveGame(userId);

    if (!game) {
      this._clearTimer(userId);
      return;
    }

    if (online) {
      this._handleReconnect(userId, game);
      return;
    }

    this._handleDisconnect(userId, game);
  }

  _handleDisconnect(userId, game) {
    const existingTimer = this.disconnectTimers.get(userId);

    if (existingTimer?.gameId === game.gameId) {
      return;
    }

    this._clearTimer(userId);

    const opponentId = this._getOpponentId(game, userId);

    this.io.to(`user:${opponentId}`).emit(
      'game:opponent-disconnected',
      {
        gameId: game.gameId,
        timeoutMs: this.timeoutMs,
      },
    );

    const timeoutId = setTimeout(() => {
      this._forfeitDisconnectedPlayer(userId, game.gameId)
        .catch((error) => {
          console.error('Disconnected player forfeit failed:', error);
        });
    }, this.timeoutMs);

    this.disconnectTimers.set(userId, {
      gameId: game.gameId,
      timeoutId,
    });
  }

  _handleReconnect(userId, game) {
    const pendingTimer = this.disconnectTimers.get(userId);

    if (!pendingTimer || pendingTimer.gameId !== game.gameId) {
      return;
    }

    this._clearTimer(userId);

    const opponentId = this._getOpponentId(game, userId);

    this.io.to(`user:${opponentId}`).emit(
      'game:opponent-reconnected',
      {
        gameId: game.gameId,
      },
    );
  }

  async _forfeitDisconnectedPlayer(userId, gameId) {
    const pendingTimer = this.disconnectTimers.get(userId);

    if (!pendingTimer || pendingTimer.gameId !== gameId) {
      return;
    }

    this.disconnectTimers.delete(userId);

    if (this.presenceService.isOnline(userId)) {
      return;
    }

    const activeGame = this.gameService.getActiveGame(userId);

    if (!activeGame || activeGame.gameId !== gameId) {
      return;
    }

    const completedGame = await this.gameService.resignGame({
      gameId,
      playerId: userId,
    });

    this.io.to(`game:${gameId}`).emit(
      'game:state',
      completedGame,
    );
  }

  _getOpponentId(game, userId) {
    return game.whiteId === userId
      ? game.blackId
      : game.whiteId;
  }

  _clearTimer(userId) {
    const pendingTimer = this.disconnectTimers.get(userId);

    if (!pendingTimer) {
      return;
    }

    clearTimeout(pendingTimer.timeoutId);
    this.disconnectTimers.delete(userId);
  }
}

module.exports = {
  GameDisconnectService,
  DEFAULT_GAME_DISCONNECT_TIMEOUT_MS,
};