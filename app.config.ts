import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Trade.ai',
  slug: 'trade-ai',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  assetBundlePatterns: ['**/*'],
  sdkVersion: '54.0.0',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.tradeai.app',
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
    },
  },
  android: {
    package: 'com.tradeai.app',
    permissions: [
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'VIBRATE',
    ],
  },
  web: {
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
  ],
  scheme: 'trade-ai',
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    binanceApiKey: process.env.EXPO_PUBLIC_BINANCE_API_KEY,
    alphaVantageApiKey: process.env.EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY,
    polygonApiKey: process.env.EXPO_PUBLIC_POLYGON_API_KEY,
  },
});
