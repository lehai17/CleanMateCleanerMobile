// Read the current build/Metro manifest, never a potentially cached Babel inline.
export function resolveApiBase(config, platform, development) {
  const configured = typeof config?.extra?.apiUrl === 'string' ? config.extra.apiUrl.trim().replace(/\/+$/, '') : '';
  if (config?.extra?.validationBuild) {
    if (!/^http:\/\/(10\.0\.2\.2|127\.0\.0\.1|localhost):15238$/.test(configured)) {
      throw new Error('Validation app requires the isolated system-test API on port 15238. Rebuild the native app with the current configuration.');
    }
  } else if (!development && !/^https:\/\//.test(configured)) {
    throw new Error('Configure an HTTPS EXPO_PUBLIC_API_URL before building the mobile app.');
  }
  const host = config?.hostUri?.split(':')[0] || (platform === 'android' ? '10.0.2.2' : 'localhost');
  return configured || `http://${host}:5238`;
}
