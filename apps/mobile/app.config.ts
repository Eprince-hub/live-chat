import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Live Chat',
  slug: 'live-chat',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.livechat.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.livechat.app',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  scheme: 'livechat',
  extra: {
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
    WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000',
  },
});
