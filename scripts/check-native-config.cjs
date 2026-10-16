// Verify the native files produced by Expo plugins, rather than only JS settings.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const base = require('../app.json').expo;
for (const variant of ['production', 'validation']) {
  const result = spawnSync(process.execPath, [require.resolve('expo/bin/cli'), 'config', '--type', 'introspect', '--json'], {
    cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, CLEANMATE_BUILD_VARIANT: variant, EXPO_PUBLIC_API_URL: 'http://10.0.2.2:15238', EXPO_NO_TELEMETRY: '1' },
  });
  if (result.status !== 0) throw new Error(result.stderr || 'Expo config failed');
  const config = JSON.parse(result.stdout), validation = variant === 'validation';
  const mods = config._internal.modResults;
  const application = mods.android.manifest.manifest.application[0];
  assert.equal(config.android.package, base.android.package + (validation ? '.validation' : ''));
  assert.equal(config.ios.bundleIdentifier, base.ios.bundleIdentifier + (validation ? '.validation' : ''));
  assert.equal(application.$['android:usesCleartextTraffic'], String(validation));
  assert.equal(mods.ios.infoPlist.NSAppTransportSecurity.NSAllowsArbitraryLoads, validation);
  assert.equal(mods.ios.infoPlist.UIUserInterfaceStyle, 'Automatic');
  const androidStyle = mods.android.strings.resources.string.find(item => item.$.name === 'expo_system_ui_user_interface_style');
  assert.equal(androidStyle._, 'automatic');
  assert.equal(config.extra.validationBuild, validation);
  if (validation) {
    const nativeSchemes = (application.activity || []).flatMap(activity => (activity['intent-filter'] || []).flatMap(filter => (filter.data || []).map(data => data.$['android:scheme'])));
    const iosSchemes = (mods.ios.infoPlist.CFBundleURLTypes || []).flatMap(type => type.CFBundleURLSchemes || []);
    for (const scheme of config.scheme) {
      assert.ok(scheme.endsWith('-validation'));
      assert.ok(nativeSchemes.includes(scheme), 'Android validation deep link must be registered');
      assert.ok(iosSchemes.includes(scheme), 'iOS validation deep link must be registered');
    }
  }
  fs.mkdirSync(path.join(root, '.expo'), { recursive: true });
  fs.writeFileSync(path.join(root, '.expo', `native-config-${variant}.json`), result.stdout);
  console.log(`${variant}: isolated identifiers, transport settings and system appearance verified`);
}
for (const url of ['', 'https://example.com', 'http://10.0.2.2:5238']) {
  const result = spawnSync(process.execPath, ['-e', "require('./app.config.js')({config:require('./app.json').expo})"], {
    cwd: root, encoding: 'utf8', env: { ...process.env, CLEANMATE_BUILD_VARIANT: 'validation', EXPO_PUBLIC_API_URL: url },
  });
  assert.notEqual(result.status, 0, 'validation must reject an implicit or non-test API');
  assert.match(result.stderr, /isolated system-test API/);
}
console.log('validation rejects missing, external and normal development API URLs');
