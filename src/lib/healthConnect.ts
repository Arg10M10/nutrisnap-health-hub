import { registerPlugin } from '@capacitor/core';

export interface HealthConnectPlugin {
  checkPermissions(options: { read: string[] }): Promise<{ granted: string[] }>;
  requestPermissions(options: { read: string[] }): Promise<{ granted: string[] }>;
  getSteps(options: { startTime: string; endTime: string }): Promise<{ count: number }>;
  isAvailable(): Promise<{ value: boolean }>;
  openHealthConnectSetting(): Promise<void>;
}

// Intentamos registrar el plugin por si estuviera disponible en el runtime nativo
const HealthConnectNative = registerPlugin<HealthConnectPlugin>('HealthConnect');

export const HealthConnect = {
  async checkPermissions(options: { read: string[] }) {
    try {
      return await HealthConnectNative.checkPermissions(options);
    } catch (e) {
      console.warn('Health Connect checkPermissions failed or not implemented', e);
      return { granted: [] };
    }
  },
  async requestPermissions(options: { read: string[] }) {
    try {
      return await HealthConnectNative.requestPermissions(options);
    } catch (e) {
      console.warn('Health Connect requestPermissions failed or not implemented', e);
      // En web/dev simulamos éxito para probar la UI
      return { granted: options.read }; 
    }
  },
  async getSteps(options: { startTime: string; endTime: string }) {
    try {
      return await HealthConnectNative.getSteps(options);
    } catch (e) {
      console.warn('Health Connect getSteps failed', e);
      return { count: 0 };
    }
  },
  async isAvailable(): Promise<boolean> {
    try {
      const result = await HealthConnectNative.isAvailable();
      return !!result?.value;
    } catch (e) {
      return false;
    }
  },
  async openHealthConnectSetting() {
    try {
      await HealthConnectNative.openHealthConnectSetting();
    } catch (e) {
      console.error('Error opening settings', e);
    }
  }
};