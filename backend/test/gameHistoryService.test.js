const test = require('node:test');
const assert = require('node:assert/strict');

const gameRepository = require('../src/repositories/gameRepository');
const gameHistoryService = require('../src/services/gameHistoryService');
const { game } = require('../src/db/prisma');

function fakeGame(overrides = {}) {
    return {
        id: 10,
        whiteId: 42,
        blackId: 84,
        status: 'COMPLETED',
        result: 'WHITE_WIN',
        winnerId: 42,
        pgn: '1. e4 e5 2. Nf3',
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updateddAt: new Date('2026-02-01T00:05:00.000Z'),
        endedAt: new Date('2026-02-01T00:05:00.000Z'),
        white: {
            id: 42,
            username: 'whitePlayer',
            rating: 1200,
            email: 'white@example.com',
            passwordHash: 'secret-white-hash',
        },
        black: {
            id: 84,
            username: 'blackPlayer',
            rating: 1250,
            email: 'black@example.com',
            passwordHash: 'secret-black-hash',
        },
        ...overrides,
    };
}

test('lists games wihtout PGN or private player data', async (t) => {
    t.mock.method(
        gameRepository,
        'findGamesByUserId',
        async () => [fakeGame()],
    );

    const games = await gameHistoryService.listGames(42);

    assert.equal(games.length, 1);
    assert.equal(games[0].id, 10);

    assert.equal(Object.hasOwn(games[0], 'pgn'), false);

    assert.deepEqual(games[0].white, {
        id: 42,
        username: 'whitePlayer',
        rating: 1200,
    });

    assert.deepEqual(games[0].black, {
        id: 84,
        username: 'blackPlayer',
        rating: 1250,
    });
});

test('retrieves a game with pgn when the current user is white', async(t) => {
    const findGameById = t.mock.method(
        gameRepository,
        'findGameById',
        async () => fakeGame(),
    );

    const game = await gameHistoryService.getGame(42, 10);

    assert.equal(findGameById.mock.callCount(), 1);
    assert.equal(findGameById.mock.calls[0].arguments[0], 10);
    assert.equal(game.id, 10);
    assert.equal(game.pgn, '1. e4 e5 2. Nf3');
});

test('retrieves a game with pgn when the current user is black', async(t) => {
    const findGameById = t.mock.method(
        gameRepository,
        'findGameById',
        async () => fakeGame(),
    );

    const game = await gameHistoryService.getGame(84, 10);

    assert.equal(game.id, 10);
    assert.equal(game.pgn, '1. e4 e5 2. Nf3');
});

test('rejects invalid game IDs without querying the repository', async (t) => {
  const findGameById = t.mock.method(
    gameRepository,
    'findGameById',
    async () => fakeGame(),
  );

  for (const gameId of [0, -1, 1.5, NaN, '10']) {
    await assert.rejects(
      gameHistoryService.getGame(42, gameId),
      (err) => (
        err.status === 400
        && err.message === 'gameId must be a positive integer'
      ),
    );
  }

  assert.equal(findGameById.mock.callCount(), 0);
});

test('returns 404 when the game does not exist', async (t) => {
  t.mock.method(
    gameRepository,
    'findGameById',
    async () => null,
  );

  await assert.rejects(
    gameHistoryService.getGame(42, 999),
    (err) => (
      err.status === 404
      && err.message === 'Game not found'
    ),
  );
});