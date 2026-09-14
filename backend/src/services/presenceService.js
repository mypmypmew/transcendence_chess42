
const DEFAULT_OFFLINE_GRACE_MS = 5000;

class PresenceService {
  constructor({ offlineGraceMs = DEFAULT_OFFLINE_GRACE_MS } = {}) {
    this.offlineGraceMs = offlineGraceMs;
    this.connections = new Map();
    this.offlineTimers = new Map();
    this.listeners = new Set();
  }
}

module.exports = {
  PresenceService,
  DEFAULT_OFFLINE_GRACE_MS,
};