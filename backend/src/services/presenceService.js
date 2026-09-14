
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
}


module.exports = {
  PresenceService,
  DEFAULT_OFFLINE_GRACE_MS,
};