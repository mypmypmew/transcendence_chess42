const test = require('node:test');
const assert = require('node:assert/strict');

const prisma = require('../src/db/prisma');
const gameRepository = require('../src/repositories/gameRepository');

const PUBLIC_PLAYER_SELECT = {
    id: true,
    username: true,
    rating: true,
};

function mockGameMethod(t, methodName, implementation) {
    const original = prisma.game[methodName];
    const calls = [];

    prisma.game[methodName] = async (...args) => {
        calls.push(args);
        return implementation(...args);
    };

    t.after(() => {
        prisma.game[methodName] = original;
    });

    return calls;
}