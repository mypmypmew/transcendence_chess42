const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

function runStartup(scenario) {
	return spawnSync(process.execPath, ['-e', `
		const assert = require('node:assert/strict');
		const http = require('node:http');
		const repository = require('./src/repositories/gameRepository');

		let resolveCancellation;
		let rejectCancellation;
		let cancellationCalls = 0;
		let listenCalls = 0;

		repository.cancelInterruptedGames = () => {
			cancellationCalls += 1;
			return new Promise((resolve, reject) => {
				resolveCancellation = resolve;
				rejectCancellation = reject;
			});
		};

		http.Server.prototype.listen = function () {
			listenCalls += 1;
			console.log('TEST_SERVER_LISTEN');
			return this;
		};

		require('./index');

		assert.equal(cancellationCalls, 1);
		assert.equal(listenCalls, 0);

		if (process.argv[1] === 'success') {
			resolveCancellation({ count: 2 });

			setImmediate(() => {
				assert.equal(listenCalls, 1);
				process.exit(0);
			});
		} else {
			rejectCancellation(new Error('TEST_CANCELLATION_FAILED'));

			setImmediate(() => {
				console.error('TEST_STARTUP_DID_NOT_EXIT');
				process.exit(2);
			});
		}
	`, scenario], {
		cwd: path.resolve(__dirname, '..'),
		encoding: 'utf8',
		timeout: 30000,
	});
}

test('startup waits for cancellation before opening the server port', () => {
	const result = runStartup('success');

	assert.ifError(result.error);
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /TEST_SERVER_LISTEN/);
	assert.match(result.stdout, /Cancelled 2 interrupted game\(s\)/);
});

test('startup exits without opening the port when cancellation fails', () => {
	const result = runStartup('failure');

	assert.ifError(result.error);
	assert.equal(result.status, 1, result.stderr);
	assert.doesNotMatch(result.stdout, /TEST_SERVER_LISTEN/);
	assert.match(result.stderr, /Backend startup failed:/);
	assert.match(result.stderr, /TEST_CANCELLATION_FAILED/);
	assert.doesNotMatch(result.stderr, /TEST_STARTUP_DID_NOT_EXIT/);
});
