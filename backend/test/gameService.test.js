const test = require('node:test');
const assert = require('node:assert/strict');

const { GameService } = require('../src/services/gameService');

test('creates a game in the initial position', () => {
  const service = new GameService();

  const game = service.createGame({
    whiteId: 1,
    blackId: 2,
  });

  assert.equal(game.whiteId, 1);
  assert.equal(game.blackId, 2);
  assert.equal(game.turn, 'w');
  assert.equal(game.status, 'IN_PROGRESS');
  assert.equal(game.result, null);
  assert.equal(game.winnerId, null);
  assert.equal(
    game.fen,
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  );
});

test('accepts a legal move and rejects invalid moves', () => {
  const service = new GameService();
  const game = service.createGame({
    whiteId: 1,
    blackId: 2,
  });

  const afterLegalMove = service.makeMove({
    gameId: game.gameId,
    playerId: 1,
    from: 'e2',
    to: 'e4',
  });

  assert.equal(afterLegalMove.turn, 'b');

  assert.throws(
    () =>
      service.makeMove({
        gameId: game.gameId,
        playerId: 1,
        from: 'g1',
        to: 'f3',
      }),
    /turn/,
  );

  assert.throws(
    () =>
      service.makeMove({
        gameId: game.gameId,
        playerId: 2,
        from: 'e7',
        to: 'e4',
      }),
    /Illegal move/,
  );

  assert.equal(
    service.getGame(game.gameId).fen,
    afterLegalMove.fen,
  );
});

test('finishes the game after checkmate', () => {
  const service = new GameService();
  const game = service.createGame({
    whiteId: 1,
    blackId: 2,
  });

  service.makeMove({
    gameId: game.gameId,
    playerId: 1,
    from: 'f2',
    to: 'f3',
  });

  service.makeMove({
    gameId: game.gameId,
    playerId: 2,
    from: 'e7',
    to: 'e5',
  });

  service.makeMove({
    gameId: game.gameId,
    playerId: 1,
    from: 'g2',
    to: 'g4',
  });

  const finished = service.makeMove({
    gameId: game.gameId,
    playerId: 2,
    from: 'd8',
    to: 'h4',
  });

  assert.equal(finished.status, 'COMPLETED');
  assert.equal(finished.result, 'BLACK_WIN');
  assert.equal(finished.winnerId, 2);
  assert.match(finished.pgn, /\[Result "0-1"\]/);

  assert.throws(
    () =>
      service.makeMove({
        gameId: game.gameId,
        playerId: 1,
        from: 'a2',
        to: 'a3',
      }),
    /completed/,
  );
});

test('finishes the game after threefold repetition', () => {
  const service = new GameService();
  const game = service.createGame({
    whiteId: 1,
    blackId: 2,
  });

  const moves = [
    [1, 'g1', 'f3'],
    [2, 'g8', 'f6'],
    [1, 'f3', 'g1'],
    [2, 'f6', 'g8'],
    [1, 'g1', 'f3'],
    [2, 'g8', 'f6'],
    [1, 'f3', 'g1'],
    [2, 'f6', 'g8'],
  ];

  let finished;

  for (const [playerId, from, to] of moves) {
    finished = service.makeMove({
      gameId: game.gameId,
      playerId,
      from,
      to,
    });
  }

  assert.equal(finished.status, 'COMPLETED');
  assert.equal(finished.result, 'DRAW');
  assert.equal(finished.winnerId, null);
  assert.match(finished.pgn, /\[Result "1\/2-1\/2"\]/);
});

test('allows a player to resign outside their turn', () => {
  const service = new GameService();
  const game = service.createGame({
    whiteId: 1,
    blackId: 2,
  });

  const finished = service.resignGame({
    gameId: game.gameId,
    playerId: 2,
  });

  assert.equal(finished.status, 'COMPLETED');
  assert.equal(finished.result, 'WHITE_WIN');
  assert.equal(finished.winnerId, 1);
  assert.match(finished.pgn, /\[Result "1-0"\]/);
});