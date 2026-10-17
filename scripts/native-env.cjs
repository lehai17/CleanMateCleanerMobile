const fs = require('node:fs');
const path = require('node:path');

exports.nativeEnvironment = (platform, variant) => {
  const env = { ...process.env, CLEANMATE_BUILD_VARIANT: variant };
  if (platform === 'android') {
    const cache = path.resolve(__dirname, '..', '.expo', 'native-build');
    const temporary = path.join(cache, 'tmp');
    fs.mkdirSync(temporary, { recursive: true });
    env.GRADLE_USER_HOME = process.env.GRADLE_USER_HOME || path.join(cache, 'gradle');
    env.TEMP = temporary;
    env.TMP = temporary;
    env.TMPDIR = temporary;
  }
  return env;
};
