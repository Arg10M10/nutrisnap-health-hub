import { registerPlugin } from '@capacitor/core';

export interface HealthConnectPlugin {
  checkPermissions(options: { read: string[] }): Promise<{ granted: string[] }>;
  requestPermissions(options: { read: string[] }): Promise<{ granted: string[] }>;
  getSteps(options: { startTime: string; endTime: string }): Promise<{ count: number }>;
  isAvailable(): Promise<{ value: boolean }>;
  openHealthConnectSetting(): Promise<void>;
}

// Registramos el plugin nativo. 
// Si el paquete @ubie/capacitor-health-connect no está instalado en el dispositivo, esto lanzará errores al llamarse.
const HealthConnectNative = registerPlugin<HealthConnectPlugin>('HealthConnect');

export const HealthConnect = {
  async checkPermissions(options: { read: string[] }) {
    // Llamada directa al plugin nativo
    return await HealthConnectNative.checkPermissions(options);
  },
  
  async requestPermissions(options: { read: string[] }) {
    // Llamada directa al plugin nativo
    return await HealthConnectNative.requestPermissions(options);
  },
  
  async getSteps(options: { startTime: string; endTime: string }) {
    // Llamada directa al plugin nativo
    return await HealthConnectNative.getSteps(options);
  },
  
  async isAvailable(): Promise<boolean> {
    try {
      const result = await HealthConnectNative.isAvailable();
      return !!result?.value;
    } catch (e) {
      // Si el plugin no está cargado (ej. en web), retornará false
      return false;
    }
  },
  
  async openHealthConnectSetting() {
    return await HealthConnectNative.openHealthConnectSetting();
  }
};