const { withAppBuildGradle, withMainApplication } = require('expo/config-plugins');
const gradleBlock = /\n[ \t]*\/\/ @generated cleanmate-validation-bundle-start[\s\S]*?\/\/ @generated cleanmate-validation-bundle-end\n?/g;
const hostBlock = /[ \t]*\/\/ @generated cleanmate-validation-host-start[\s\S]*?\/\/ @generated cleanmate-validation-host-end/g;

module.exports = (config, { enabled = false } = {}) => {
  config = withAppBuildGradle(config, mod => {
    let source = mod.modResults.contents.replace(gradleBlock, '\n');
    if (enabled) {
      if (mod.modResults.language !== 'groovy' || !/\breact\s*\{/.test(source)) throw new Error('Unsupported Android Gradle template for bundled validation');
      source = source.replace(/\breact\s*\{/, 'react {\n    // @generated cleanmate-validation-bundle-start\n    debuggableVariants = []\n    extraPackagerArgs = ["--max-workers", "2"]\n    // @generated cleanmate-validation-bundle-end');
    }
    mod.modResults.contents = source;
    return mod;
  });
  return withMainApplication(config, mod => {
    let source = mod.modResults.contents.replace(hostBlock, '    override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG');
    if (enabled) {
      const method = /override fun getUseDeveloperSupport\(\)(?:\s*:\s*Boolean)?\s*=\s*BuildConfig\.DEBUG/;
      if (mod.modResults.language !== 'kt' || !method.test(source)) throw new Error('Unsupported Kotlin React Native host for bundled validation');
      source = source.replace(method, '// @generated cleanmate-validation-host-start\n    override fun getUseDeveloperSupport(): Boolean = false\n    // @generated cleanmate-validation-host-end');
    }
    mod.modResults.contents = source;
    return mod;
  });
};
