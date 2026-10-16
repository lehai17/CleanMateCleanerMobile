const { withAndroidManifest, withInfoPlist, AndroidConfig } = require('expo/config-plugins');

module.exports = (config, { allowCleartext = false } = {}) => {
  config = withAndroidManifest(config, mod => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    application.$['android:usesCleartextTraffic'] = allowCleartext ? 'true' : 'false';
    return mod;
  });
  return withInfoPlist(config, mod => {
    mod.modResults.NSAppTransportSecurity = {
      ...mod.modResults.NSAppTransportSecurity,
      NSAllowsArbitraryLoads: allowCleartext,
    };
    return mod;
  });
};
