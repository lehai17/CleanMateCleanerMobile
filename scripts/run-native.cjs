const { spawnSync } = require('node:child_process');
const [platform, variant = 'production', ...args] = process.argv.slice(2);
if (!['android', 'ios'].includes(platform) || !['production', 'validation'].includes(variant)) {
  throw new Error('Usage: run-native.cjs android|ios production|validation [Expo run arguments]');
}
if (platform === 'ios' && process.platform !== 'darwin') throw new Error('An iOS native build requires macOS and Xcode.');
const cli = require.resolve('expo/bin/cli');
const env = { ...process.env, CLEANMATE_BUILD_VARIANT: variant };
// Regenerate config before switching identifiers; an existing native directory
// otherwise makes Expo run skip prebuild and can install the wrong variant.
for (const command of [['prebuild', '--platform', platform, '--no-install'], [`run:${platform}`, ...args]]) {
  const result = spawnSync(process.execPath, [cli, ...command], { stdio: 'inherit', env });
  if (result.status !== 0) process.exit(result.status || 1);
}
