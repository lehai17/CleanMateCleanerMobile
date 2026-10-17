module.exports = ({ config }) => {
  const variant = process.env.CLEANMATE_BUILD_VARIANT || 'production';
  if (!['production', 'validation'].includes(variant)) throw new Error('Unknown CLEANMATE_BUILD_VARIANT');
  const validation = variant === 'validation';
  const bundledValidation = validation && process.env.CLEANMATE_BUNDLE_VALIDATION === '1';
  const api = (process.env.EXPO_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
  if (validation && !/^http:\/\/(10\.0\.2\.2|127\.0\.0\.1|localhost):15238$/.test(api)) {
    throw new Error('Validation builds require EXPO_PUBLIC_API_URL pointing to the isolated system-test API on port 15238.');
  }
  return {
    ...config,
    name: validation ? `${config.name} Validation` : config.name,
    scheme: validation
      ? (Array.isArray(config.scheme) ? config.scheme : [config.scheme || config.android.package]).map(value => `${value}-validation`)
      : config.scheme,
    android: { ...config.android, package: `${config.android.package}${validation ? '.validation' : ''}` },
    ios: { ...config.ios, bundleIdentifier: `${config.ios.bundleIdentifier}${validation ? '.validation' : ''}` },
    extra: { ...config.extra, validationBuild: validation, bundledValidation, apiUrl: api || undefined },
    plugins: [...(config.plugins || []), ['./plugins/with-network-security.cjs', { allowCleartext: validation }], ['./plugins/with-validation-bundle.cjs', { enabled: bundledValidation }]],
  };
};
