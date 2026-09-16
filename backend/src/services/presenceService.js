
const DEFAULT_OFFLINE_GRACE_MS = 5000;

function validateUserId(userId) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new TypeError('User id must be a positive integer');
  }
}

function validateSocketId(socketId) {
  if (typeof socketId !== 'string' || socketId.length === 0) {
    throw new TypeError('Socket id must be a non-empty string');
  }
}

class PresenceService {
  constructor({ offlineGraceMs = DEFAULT_OFFLINE_GRACE_MS } = {}) {
    this.offlineGraceMs = offlineGraceMs;
    this.connections = new Map();
    this.offlineTimers = new Map();
    this.listeners = new Set();
  }
  onChange(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function');
    }

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(change) {
    for (const listener of this.listeners) {
      try {
        listener(change);
      } catch (err) {
        console.error('presence listener failed:', err);
      }
    }
  }
  addConnection(userId, socketId) {
    validateUserId(userId);
    validateSocketId(socketId);

    const pendingTimer = this.offlineTimers.get(userId);

    if (pendingTimer) {
      clearTimeout(pendingTimer);
      this.offlineTimers.delete(userId);
    }

    let sockets = this.connections.get(userId);
    const wasOnline = Boolean(sockets);

    if (!sockets) {
      sockets = new Set();
      this.connections.set(userId, sockets);
    }

    sockets.add(socketId);

    if (wasOnline) {
      return false;
    }

    this.notify({ userId, online: true });

    return true;
  }
  isOnline(userId) {
    validateUserId(userId);

    return this.connections.has(userId);
  }

  filterOnline(userIds) {
    if (!Array.isArray(userIds)) {
      throw new TypeError('userIds must be an array');
    }

    return userIds.filter((userId) => this.connections.has(userId));
  }
  removeConnection(userId, socketId) {
    validateUserId(userId);
    validateSocketId(socketId);

    const sockets = this.connections.get(userId);

    if (!sockets || !sockets.delete(socketId)) {
      return false;
    }

    if (sockets.size > 0) {
      return false;
    }

    const timer = setTimeout(() => {
      this.offlineTimers.delete(userId);

      const remaining = this.connections.get(userId);

      if (!remaining || remaining.size > 0) {
        return;
      }

      this.connections.delete(userId);
      this.notify({ userId, online: false });
    }, this.offlineGraceMs);

    this.offlineTimers.set(userId, timer);

    return true;
  }
}


module.exports = {
  PresenceService,
  DEFAULT_OFFLINE_GRACE_MS,
};