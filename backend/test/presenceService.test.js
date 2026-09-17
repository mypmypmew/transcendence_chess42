const test = require('node:test');
const assert = require('node:assert/strict');

const { PresenceService } = require('../src/services/presenceService');

function createService(t, options = {}) {
  t.mock.timers.enable({ apis: ['setTimeout'] });

  const changes = [];
  const service = new PresenceService({ offlineGraceMs: 1000, ...options });

  service.onChange((change) => {
    changes.push(change);
  });

  return { service, changes };
}

test('first connection marks the user online exactly once', (t) => {
  const { service, changes } = createService(t);

  assert.equal(service.addConnection(7, 'socket-a'), true);
  assert.equal(service.addConnection(7, 'socket-b'), false);

  assert.equal(service.isOnline(7), true);
  assert.deepEqual(changes, [{ userId: 7, online: true }]);
});

test('closing one of several tabs keeps the user online', (t) => {
  const { service, changes } = createService(t);

  service.addConnection(7, 'socket-a');
  service.addConnection(7, 'socket-b');

  assert.equal(service.removeConnection(7, 'socket-a'), false);
  t.mock.timers.tick(5000);

  assert.equal(service.isOnline(7), true);
  assert.deepEqual(changes, [{ userId: 7, online: true }]);
});

test('closing the last connection marks the user offline after the grace period', (t) => {
  const { service, changes } = createService(t);

  service.addConnection(7, 'socket-a');

  assert.equal(service.removeConnection(7, 'socket-a'), true);
  assert.equal(service.isOnline(7), true);

  t.mock.timers.tick(999);
  assert.equal(service.isOnline(7), true);

  t.mock.timers.tick(1);
  assert.equal(service.isOnline(7), false);
  assert.deepEqual(changes, [
    { userId: 7, online: true },
    { userId: 7, online: false },
  ]);
});

test('reconnecting during the grace period cancels the offline transition', (t) => {
  const { service, changes } = createService(t);

  service.addConnection(7, 'socket-a');
  service.removeConnection(7, 'socket-a');

  t.mock.timers.tick(500);
  assert.equal(service.addConnection(7, 'socket-b'), false);

  t.mock.timers.tick(5000);

  assert.equal(service.isOnline(7), true);
  assert.deepEqual(changes, [{ userId: 7, online: true }]);
});

test('removing an unknown connection is a no-op', (t) => {
  const { service, changes } = createService(t);

  assert.equal(service.removeConnection(7, 'socket-a'), false);
  assert.equal(service.isOnline(7), false);
  assert.deepEqual(changes, []);
});

test('filterOnline keeps only the online ids among the given users', (t) => {
  const { service } = createService(t);

  service.addConnection(3, 'socket-a');
  service.addConnection(9, 'socket-b');

  assert.deepEqual(service.filterOnline([1, 3, 5, 9]), [3, 9]);
  assert.deepEqual(service.filterOnline([]), []);
});

test('onChange returns an unsubscribe function', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });

  const service = new PresenceService({ offlineGraceMs: 1000 });
  const changes = [];
  const unsubscribe = service.onChange((change) => changes.push(change));

  unsubscribe();
  service.addConnection(7, 'socket-a');

  assert.deepEqual(changes, []);
});

test('rejects invalid user ids and socket ids', (t) => {
  const { service } = createService(t);

  assert.throws(() => service.addConnection(0, 'socket-a'), TypeError);
  assert.throws(() => service.addConnection('7', 'socket-a'), TypeError);
  assert.throws(() => service.addConnection(7, ''), TypeError);
  assert.throws(() => service.removeConnection(-1, 'socket-a'), TypeError);
});
