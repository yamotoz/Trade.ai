import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Trade.ai',
  slug: 'trade-ai',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#000000',
  },
  assetBundlePatterns: ['**/*'],
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
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#000000',
    },
    package: 'com.tradeai.app',
    permissions: [
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'VIBRATE',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'react-native-google-mobile-ads',
  ],
  scheme: 'trade-ai',
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    admobAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID,
    admobBannerId: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID,
    admobInterstitialId: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID,
    binanceApiKey: process.env.EXPO_PUBLIC_BINANCE_API_KEY,
    alphaVantageApiKey: process.env.EXPO_PUBLIC_ALPHA_VANTAGE_API_KEY,
    polygonApiKey: process.env.EXPO_PUBLIC_POLYGON_API_KEY,
  },
});
