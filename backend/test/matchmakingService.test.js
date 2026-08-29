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
