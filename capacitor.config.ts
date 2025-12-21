import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.calorel.app',
  appName: 'Calorel',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      // Debe ser el ID de Cliente WEB
      serverClientId: '733617800360-gdfv4o8j13anns76lj1hmf64deeuo8iq.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;