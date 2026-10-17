const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { nativeEnvironment } = require('./native-env.cjs');
const root = path.resolve(__dirname, '..'), base = require('../app.json').expo.android.package;
for (const [variant, bundled] of [['validation', true], ['production', false], ['validation', true], ['validation', true]]) {
  const env = { ...nativeEnvironment('android', variant), CLEANMATE_BUNDLE_VALIDATION: bundled ? '1' : '0', EXPO_PUBLIC_API_URL: 'http://10.0.2.2:15238', EXPO_NO_TELEMETRY: '1', CI: 'true' };
  const result = spawnSync(process.execPath, [require.resolve('expo/bin/cli'), 'prebuild', '--platform', 'android', '--no-install'], { cwd: root, env, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  const appId = base + (variant === 'validation' ? '.validation' : '');
  const kotlin = fs.readFileSync(path.join(root, 'android/app/src/main/java', ...appId.split('.'), 'MainApplication.kt'), 'utf8');
  const gradle = fs.readFileSync(path.join(root, 'android/app/build.gradle'), 'utf8');
  assert.equal((gradle.match(/@generated cleanmate-validation-bundle-start/g) || []).length, bundled ? 1 : 0);
  assert.equal((kotlin.match(/@generated cleanmate-validation-host-start/g) || []).length, bundled ? 1 : 0);
  assert.match(kotlin, bundled ? /getUseDeveloperSupport\(\): Boolean = false/ : /getUseDeveloperSupport\(\): Boolean = BuildConfig\.DEBUG/);
  if (bundled) assert.match(gradle, /debuggableVariants = \[\]/);
  console.log(`${variant}${bundled ? '-bundled' : ''}: generated native package and developer/bundle mode verified`);
}
