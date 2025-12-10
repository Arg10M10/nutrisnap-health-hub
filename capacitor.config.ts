import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.calorel.app',
  appName: 'Calorel',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '522700969452-vahnkkv9fr8l1rqvfb1e9do2opsp8p2k.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;