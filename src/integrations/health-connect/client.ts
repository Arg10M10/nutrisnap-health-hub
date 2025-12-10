import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { HealthConnect } from 'capacitor-plugin-health-connect';

const isAvailable = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

/**
 * Comprueba si Health Connect está instalado y disponible en el dispositivo.
 */
const checkAvailability = async () => {
  if (!isAvailable()) {
    console.log("Health Connect no está disponible en esta plataforma.");
    return 'NOT_SUPPORTED';
  }
  try {
    return await HealthConnect.checkAvailability();
  } catch (error) {
    console.error("Error al comprobar la disponibilidad de Health Connect:", error);
    return 'NOT_SUPPORTED';
  }
};

/**
 * Solicita permisos al usuario para leer datos de Health Connect.
 */
const requestPermissions = async (): Promise<boolean> => {
  const availability = await checkAvailability();
  if (availability !== 'INSTALLED') {
    if (availability === 'NOT_INSTALLED') {
      toast.info("Health Connect no está instalado", { description: "Por favor, instala la app de Health Connect desde la Play Store." });
      await HealthConnect.openHealthConnectSettings();
    }
    return false;
  }

  try {
    const result = await HealthConnect.requestAuthorization({
      read: ['Steps', 'TotalCaloriesBurned']
    });
    
    if (result.granted) {
      console.log("Permisos de Health Connect concedidos.");
      return true;
    } else {
      console.log("Permisos de Health Connect denegados.");
      toast.info("Permisos denegados", { description: "No se pudo acceder a Health Connect." });
      return false;
    }
  } catch (error) {
    console.error("Error al solicitar permisos de Health Connect:", error);
    toast.error("Error de Health Connect", { description: "No se pudo solicitar permisos." });
    return false;
  }
};

/**
 * Obtiene el conteo de pasos de hoy desde Health Connect.
 */
const getSteps = async (): Promise<number> => {
    if (!isAvailable()) {
        return Math.floor(Math.random() * 5000) + 1000; // Simulación para web
    }
    
    try {
        const today = new Date();
        const startTime = new Date(today.setHours(0, 0, 0, 0));

        const response = await HealthConnect.readData({
            startTime: startTime.toISOString(),
            endTime: new Date().toISOString(),
            dataType: 'Steps',
        });
        
        const totalSteps = response.reduce((sum, record) => sum + record.count, 0);
        return totalSteps;

    } catch (error) {
        console.error("Error al leer los pasos de Health Connect:", error);
        return 0;
    }
};

/**
 * Obtiene las calorías activas quemadas hoy desde Health Connect.
 */
const getCalories = async (): Promise<number> => {
    if (!isAvailable()) {
        return Math.floor(Math.random() * 300) + 50; // Simulación para web
    }

    try {
        const today = new Date();
        const startTime = new Date(today.setHours(0, 0, 0, 0));

        const response = await HealthConnect.readData({
            startTime: startTime.toISOString(),
            endTime: new Date().toISOString(),
            dataType: 'TotalCaloriesBurned',
        });

        const totalCalories = response.reduce((sum, record) => sum + record.energy.value, 0);
        return Math.round(totalCalories);

    } catch (error) {
        console.error("Error al leer las calorías de Health Connect:", error);
        return 0;
    }
};

export const HealthConnectClient = {
  isAvailable,
  requestPermissions,
  getSteps,
  getCalories,
};