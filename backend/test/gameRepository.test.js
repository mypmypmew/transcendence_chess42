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

test('game list returns an empty array when the user has no games', async (t) => {
    const findManyCalls = mockGameMethod(
        t,
        'findMany',
        async () => [],
    );

    const games = await gameRepository.findGamesByUserId(42);

    assert.equal(findManyCalls.length, 1);
    assert.deepEqual(games, []);
});

test('game lookup includes only public white and black player fields', async(t) => {
    const findUniqueCalls = mockGameMethod(
        t,
        'findUnique',
        async () => null,
    );

    await gameRepository.findGameById(10);

    assert.equal(findUniqueCalls.length, 1);

    const query = findUniqueCalls[0][0];

    assert.deepEqual(query, {
        where: { id: 10 },
        include: {
            white: { select: PUBLIC_PLAYER_SELECT },
            black: { select: PUBLIC_PLAYER_SELECT },
        },
    });

    assert.equal(
        Object.hasOwn(query.include.white.select, 'email'),
        false,
    );

    assert.equal(
        Object.hasOwn(query.include.white.select, 'passwordHash'),
        false,
    );

    assert.equal(
        Object.hasOwn(query.include.black.select, 'email'),
        false,
    );

        assert.equal(
        Object.hasOwn(query.include.black.select, 'passwordHash'),
        false,
    );
});

test('game history repository rejects invalid IDs before querying Prisma', async(t) => {
    const findManyCalls = mockGameMethod(
        t,
        'findMany',
        async () => [],
    );
    const findUniqueCalls = mockGameMethod(
        t,
        'findUnique',
        async () => null,
    );

    await assert.rejects(
        gameRepository.findGamesByUserId(0),
        (err) => (
            err instanceof TypeError
            && err.message === 'userId must be a positive integer'
        ),
    );

    await assert.rejects(
        gameRepository.findGameById(-1),
        (err) => (
            err instanceof TypeError
            && err.message === 'gameId must be a positive integer'
        ),
    )

    assert.equal(findManyCalls.length, 0);
    assert.equal(findUniqueCalls.length, 0);
});