const test = require('node:test');
const assert = require('node:assert/strict');
const chatRepository = require('../src/repositories/chatRepository');
const chatService = require('../src/services/chatService');
const registerChatHandlers = require('../src/sockets/chatSocket');

function fakeSocket(userId) {
  const handlers = {};

  return {
    data: { userId },
    joinedRooms: [],
    on(event, handler) {
      handlers[event] = handler;
    },
    join(room) {
      this.joinedRooms.push(room);
    },
    emitTo(event, ...args) {
      return handlers[event](...args);
    },
  };
}