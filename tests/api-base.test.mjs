import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/apiBase.js', import.meta.url), 'utf8');
const { resolveApiBase } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('a new manifest changes the API without reloading the cached resolver module', () => {
  assert.equal(resolveApiBase({ extra: { apiUrl: 'https://first.example.test/' } }, 'android', false), 'https://first.example.test');
  assert.equal(resolveApiBase({ extra: { apiUrl: 'https://second.example.test/' } }, 'android', false), 'https://second.example.test');
});
test('release startup fails closed without a manifest HTTPS endpoint', () => {
  for (const config of [undefined, {}, { extra: {} }, { extra: { apiUrl: 'http://localhost:5238' } }]) {
    assert.throws(() => resolveApiBase(config, 'android', false), /HTTPS EXPO_PUBLIC_API_URL/);
  }
});
test('an old validation APK cannot silently fall back to the normal development backend', () => {
  assert.throws(() => resolveApiBase({ extra: { validationBuild: true } }, 'android', true), /Rebuild the native app/);
});
test('validation rejects external and normal development endpoints in debug and release', () => {
  for (const development of [true, false]) for (const apiUrl of ['https://example.test', 'http://10.0.2.2:5238', 'http://127.0.0.1:15238/api']) {
    assert.throws(() => resolveApiBase({ extra: { validationBuild: true, apiUrl } }, 'android', development), /isolated system-test API/);
  }
});
test('validation supports explicit local test endpoints and trims their trailing slash', () => {
  for (const host of ['10.0.2.2', 'localhost', '127.0.0.1']) {
    assert.equal(resolveApiBase({ extra: { validationBuild: true, apiUrl: ` http://${host}:15238/ ` } }, 'android', false), `http://${host}:15238`);
  }
});
test('ordinary development retains Metro-host and platform fallbacks', () => {
  assert.equal(resolveApiBase({ hostUri: '192.168.1.20:8081' }, 'android', true), 'http://192.168.1.20:5238');
  assert.equal(resolveApiBase({}, 'android', true), 'http://10.0.2.2:5238');
  assert.equal(resolveApiBase({}, 'ios', true), 'http://localhost:5238');
});
