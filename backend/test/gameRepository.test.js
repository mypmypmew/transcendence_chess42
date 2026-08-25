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

test('game list finds games where the user is white or black, newest first', async(t) => {
    const expectedGames = [
        { id: 2, createdAt: new Date('2026-02-02T00:00:00.000Z') },
        { id: 1, createdAt: new Date('2026-02-01T00:00:00.000Z') },
    ];

    const findManyCalls = mockGameMethod(
        t,
        'findMany',
        async () => expectedGames,
    );

    const games = await gameRepository.findGamesByUserId(42);

    assert.equal(findManyCalls.length, 1);

    assert.deepEqual(findManyCalls[0][0], {
        where: {
            OR: [
                { whiteId: 42},
                { blackId: 42},
            ],
        },
        include: {
            white: { select: PUBLIC_PLAYER_SELECT },
            black: { select: PUBLIC_PLAYER_SELECT },
        },
        orderBy: { createdAt: 'desc' },
    });

    assert.equal(games, expectedGames);
});