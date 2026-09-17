const test = require('node:test');
const assert = require('node:assert/strict');

const gameRepository = require('../src/repositories/gameRepository');
const userRepository = require('../src/repositories/userRepository');
const gameHistoryService = require('../src/services/gameHistoryService');

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
        updatedAt: new Date('2026-02-01T00:05:00.000Z'),
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

test('lists games without PGN or private player data', async (t) => {
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

test('retrieves a game with pgn when the current user is white', async (t) => {
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

test('returns 404 when the current user is not a participant', async (t) => {
  t.mock.method(
    gameRepository,
    'findGameById',
    async () => fakeGame(),
  );

  await assert.rejects(
    gameHistoryService.getGame(100, 10),
    (err) => (
      err.status === 404
      && err.message === 'Game not found'
    ),
  );
});

test('lists public history for the selected player', async (t) => {
  const findPlayer = t.mock.method(
    userRepository,
    'findPublicUserById',
    async () => ({ id: 84 }),
  );
  const findGames = t.mock.method(
    gameRepository,
    'findGamesByUserId',
    async () => [fakeGame()],
  );

  const games = await gameHistoryService.listPlayerGames(84);

  assert.equal(findPlayer.mock.callCount(), 1);
  assert.deepEqual(findPlayer.mock.calls[0].arguments, [84]);
  assert.equal(findGames.mock.callCount(), 1);
  assert.deepEqual(findGames.mock.calls[0].arguments, [84]);

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

test('returns empty history for an existing player without games', async (t) => {
  t.mock.method(
    userRepository,
    'findPublicUserById',
    async () => ({ id: 42 }),
  );

  t.mock.method(
    gameRepository,
    'findGamesByUserId',
    async () => [],
  );

  assert.deepEqual(await gameHistoryService.listPlayerGames(42), []);
});

test('rejects invalid player IDs before querying repositories', async (t) => {
  const findPlayer = t.mock.method(
    userRepository,
    'findPublicUserById',
    async () => null,
  );

  const findGames = t.mock.method(
    gameRepository,
    'findGamesByUserId',
    async () => [],
  );

  for (const playerId of [
    undefined, null, '42', 0, -1, 1.5, NaN, Infinity,
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    await assert.rejects(
      () => gameHistoryService.listPlayerGames(playerId),
      {
        status: 400,
        message: 'playerId must be a positive integer',
      },
    );
  }

  assert.equal(findPlayer.mock.callCount(), 0);
  assert.equal(findGames.mock.callCount(), 0);
});

test('returns 404 for a missing player without querying games', async (t) => {
  t.mock.method(
    userRepository,
    'findPublicUserById',
    async () => null,
  );

  const findGames = t.mock.method(
    gameRepository,
    'findGamesByUserId',
    async () => [],
  );

  await assert.rejects(
    () => gameHistoryService.listPlayerGames(999),
    {
      status: 404,
      message: 'Player not found',
    },
  );

  assert.equal(findGames.mock.callCount(), 0);
});

test('propagates history lookup failures instead of returning an empty list', async (t) => {
  const databaseError = new Error('History lookup failed');

  t.mock.method(
    userRepository,
    'findPublicUserById',
    async () => ({ id: 42 }),
  );

  t.mock.method(
    gameRepository,
    'findGamesByUserId',
    async () => { throw databaseError; },
  );

  await assert.rejects(
    () => gameHistoryService.listPlayerGames(42),
    (error) => error === databaseError,
  );
});

test('calculates completed game outcomes for both player colors', async (t) => {
  t.mock.method(
    userRepository,
    'findPublicUserById',
    async (id) => ({ id }),
  );

  const games = [
    fakeGame({ id: 1, result: 'WHITE_WIN', winnerId: 42 }),
    fakeGame({ id: 2, result: 'BLACK_WIN', winnerId: 84 }),
    fakeGame({ id: 3, result: 'DRAW', winnerId: null }),
  ];

  t.mock.method(
    gameRepository,
    'findGamesByUserId',
    async () => games,
  );

  const whiteHistory = await gameHistoryService.listPlayerGames(42);
  const blackHistory = await gameHistoryService.listPlayerGames(84);

  assert.deepEqual(
    whiteHistory.map((game) => game.outcome),
    ['WIN', 'LOSS', 'DRAW'],
  );
  assert.deepEqual(
    blackHistory.map((game) => game.outcome),
    ['LOSS', 'WIN', 'DRAW'],
  );

  assert.deepEqual(
    whiteHistory.map((game) => game.result),
    ['WHITE_WIN', 'BLACK_WIN', 'DRAW'],
  );
  assert.deepEqual(
    blackHistory.map((game) => game.result),
    ['WHITE_WIN', 'BLACK_WIN', 'DRAW'],
  );
});

test('does not count unfinished or cancelled games as losses', async (t) => {
  t.mock.method(
    userRepository,
    'findPublicUserById',
    async (id) => ({ id }),
  );
  t.mock.method(
    gameRepository,
    'findGamesByUserId',
    async () => [
      fakeGame({
        id: 1,
        status: 'IN_PROGRESS',
        result: null,
        winnerId: null,
        endedAt: null,
      }),
      fakeGame({
        id: 2,
        status: 'CANCELLED',
        result: null,
        winnerId: null,
      }),
    ],
  );

  for (const playerId of [42, 84]) {
    const games = await gameHistoryService.listPlayerGames(playerId);

    assert.deepEqual(
      games.map((game) => game.outcome),
      ['IN_PROGRESS', 'CANCELLED'],
    );
  }
});

test('rejects invalid completed results instead of inventing an outcome', async (t) => {
  t.mock.method(
    userRepository,
    'findPublicUserById',
    async (id) => ({ id: 42 }),
  );

  let storedResult;
  t.mock.method(
    gameRepository,
    'findGamesByUserId',
    async () => [
      fakeGame({ result: storedResult }),
    ],
  );

  for (const result of [null, 'UNKNOWN']) {
    storedResult = result;

    await assert.rejects(
      () => gameHistoryService.listPlayerGames(42),
      /Completed game has an invalid result/,
    );
  }
});

test('rejects unexpected game statuses', async (t) => {
  t.mock.method(
    userRepository,
    'findPublicUserById',
    async () => ({ id: 42 }),
  );

  t.mock.method(
    gameRepository,
    'findGamesByUserId',
    async () => [
      fakeGame({ status: 'UNKNOWN' }),
    ],
  );

  await assert.rejects(
    () => gameHistoryService.listPlayerGames(42),
    /Unexpected game status/,
  );
});
