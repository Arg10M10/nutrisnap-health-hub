import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.calorel.app',
  appName: 'Calorel',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      // Debe ser el ID de Cliente WEB
      serverClientId: '522700969452-gof3re6i21fc0eotfbk4q496ke3gdl0k.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;