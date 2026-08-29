const test = require('node:test');
const assert = require('node:assert/strict');

const {
	MatchmakingService,
} = require('../src/services/matchmakingService');

test('keeps the first player waiting for an opponent', async () => {
  // Count game creation attempts to prove that one player is not enough to start a multiplayer game.
  let createGameCalls = 0;

  const fakeGameService = {
    // Simulate the GameService dependency without creating a database record.
    async createGame() {
      createGameCalls += 1;

      return {
        gameId: 42,
      };
    },
  };

  // Inject the fake dependency so this test checks only matchmaking behavior.
  const matchmakingService = new MatchmakingService({
    gameService: fakeGameService,
  });

  // The first authenticated player enters the matchmaking queue.
  const result = await matchmakingService.join(1);

  // One player must remain waiting until another player joins.
  assert.deepEqual(result, {
    status: 'WAITING',
  });

  // Matchmaking must not create a game for a player alone.
  assert.equal(createGameCalls, 0);
});

test('matches the second player and creates a game', async () => {
  // Store the players passed to GameService so the test can verify their assigned chess colors.
  let createdPlayers = null;

  const createdGame = {
    gameId: 42,
    whiteId: 1,
    blackId: 2,
  };

  const fakeGameService = {
    // Simulate authoritative game creation without Prisma or chess.js.
    async createGame(players) {
      createdPlayers = players;

      return createdGame;
    },
  };

  const matchmakingService = new MatchmakingService({
    gameService: fakeGameService,
  });

  // The first player occupies the waiting slot.
  const waitingResult = await matchmakingService.join(1);

  assert.deepEqual(waitingResult, {
    status: 'WAITING',
  });

  // The second player completes the pair and starts the game.
  const matchedResult = await matchmakingService.join(2);

  // The first waiting player receives white and the second player receives black.
  assert.deepEqual(createdPlayers, {
    whiteId: 1,
    blackId: 2,
  });

  // Return the server-created game so the socket.IO layer can notify both players.
  assert.deepEqual(matchedResult, {
    status: 'MATCHED',
    game: createdGame,
  });
});

test('rejects a player who is already waiting', async () => {
  // Count game creation attempts to prove that a duplicate join cannot create a game aginst the same user.
  let createGameCalls = 0;

  const fakeGameService = {
    async createGame() {
      createGameCalls += 1;

      return {
        gameId: 42,
      };
    },
  };

  const matchmakingService = new MatchmakingService({
    gameService: fakeGameService,
  });

  // The player enters the queue for the first time.
  await matchmakingService.join(1);

  // A repeated request from the same authenticated user must be rejected.
  await assert.rejects(
    () => matchmakingService.join(1),
    /already waiting/,
  );

  // No game may be created with the same user as both players.
  assert.equal(createGameCalls, 0);
});
