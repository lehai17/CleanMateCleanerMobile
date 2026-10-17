// Build an isolated x86_64 debug APK without selecting or touching any device.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { nativeEnvironment } = require('./native-env.cjs');
const root = path.resolve(__dirname, '..'), android = path.join(root, 'android');
const env = { ...nativeEnvironment('android', 'validation'), CLEANMATE_BUNDLE_VALIDATION: '1', NODE_ENV: 'production' };
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
run(process.execPath, [require.resolve('expo/bin/cli'), 'prebuild', '--platform', 'android', '--no-install']);
const java = env.JAVA_HOME ? path.join(env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java') : 'java';
run(java, ['-Xmx64m', '-Xms64m', '-jar', path.join(android, 'gradle/wrapper/gradle-wrapper.jar'), ':app:assembleDebug', '--no-daemon', '--max-workers=2', '-PreactNativeArchitectures=x86_64'], android);
const output = path.join(android, 'app/build/outputs/apk/debug');
const metadata = JSON.parse(fs.readFileSync(path.join(output, 'output-metadata.json'), 'utf8'));
if (metadata.applicationId !== require('../app.json').expo.android.package + '.validation') throw new Error('APK is not the expected isolated validation application');
const apk = path.join(output, metadata.elements[0].outputFile);
if (!fs.existsSync(apk)) throw new Error('APK output is missing');
const inspection = fs.mkdtempSync(path.join(root, '.expo/native-build/apk-check-'));
const jar = env.JAVA_HOME ? path.join(env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'jar.exe' : 'jar') : 'jar';
run(jar, ['xf', apk, 'assets/app.config', 'assets/index.android.bundle'], inspection);
const manifest = JSON.parse(fs.readFileSync(path.join(inspection, 'assets/app.config'), 'utf8'));
const expectedApi = (env.EXPO_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
if (manifest.extra?.validationBuild !== true || manifest.extra?.bundledValidation !== true || manifest.extra?.apiUrl !== expectedApi) {
  throw new Error('APK manifest does not contain the current isolated test API configuration');
}
if (fs.statSync(path.join(inspection, 'assets/index.android.bundle')).size < 100000) throw new Error('APK JavaScript bundle is missing or incomplete');
console.log('APK identifier and embedded test API verified.');
console.log(`Validation APK: ${apk}`);
