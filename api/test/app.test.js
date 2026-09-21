import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

const startTestServer = () => new Promise((resolve) => {
  const server = app.listen(0, () => resolve(server));
});

test('health endpoint returns service status', async (t) => {
  const server = await startTestServer();
  t.after(() => server.close());

  const response = await fetch(`http://localhost:${server.address().port}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'ok',
    service: 'forkity-api',
  });
});

test('unknown routes return a JSON 404 response', async (t) => {
  const server = await startTestServer();
  t.after(() => server.close());

  const response = await fetch(`http://localhost:${server.address().port}/missing`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { message: 'Route not found' });
});

test('malformed JSON returns a JSON 400 response', async (t) => {
  const server = await startTestServer();
  t.after(() => server.close());

  const response = await fetch(`http://localhost:${server.address().port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { message: 'Malformed JSON request body' });
});