import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
// Importamos el plugin real de Health Connect.
// Este es el nombre correcto del paquete.
import { HealthConnect as HealthConnectPlugin } from 'capacitor-health-connect';

const isAvailable = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

/**
 * Solicita permisos al usuario para leer datos de Health Connect.
 * Llama al plugin nativo si está en Android, de lo contrario no hace nada en web.
 */
const requestPermissions = async (): Promise<boolean> => {
  if (!isAvailable()) {
    console.log("Health Connect no está disponible en esta plataforma (usando simulación web).");
    // En la web, no pedimos permisos reales, así que asumimos que se conceden para continuar el flujo.
    return true;
  }

  try {
    // Esta es la llamada real al plugin nativo.
    const result = await HealthConnectPlugin.requestPermissions({
      // NOTA: Adapta estos permisos a los que necesites exactamente.
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
 * Si no está en un dispositivo nativo, devuelve un valor simulado.
 */
const getSteps = async (): Promise<number> => {
    if (!isAvailable()) {
        // Simulación para desarrollo en web.
        return Math.floor(Math.random() * 5000) + 1000;
    }
    
    try {
        // Llamada real al plugin para obtener los pasos de hoy.
        const today = new Date();
        const startTime = new Date(today.setHours(0, 0, 0, 0));

        const response = await HealthConnectPlugin.readRecords({
            recordType: 'Steps',
            timeRange: {
                operator: 'between',
                startTime: startTime.toISOString(),
                endTime: new Date().toISOString(),
            }
        });
        
        const totalSteps = response.records.reduce((sum, record) => sum + (record.count as number), 0);
        return totalSteps;

    } catch (error) {
        console.error("Error al leer los pasos de Health Connect:", error);
        return 0;
    }
};

/**
 * Obtiene las calorías activas quemadas hoy desde Health Connect.
 * Si no está en un dispositivo nativo, devuelve un valor simulado.
 */
const getCalories = async (): Promise<number> => {
    if (!isAvailable()) {
        // Simulación para desarrollo en web.
        return Math.floor(Math.random() * 300) + 50;
    }

    try {
        // Llamada real al plugin para obtener las calorías de hoy.
        const today = new Date();
        const startTime = new Date(today.setHours(0, 0, 0, 0));

        const response = await HealthConnectPlugin.readRecords({
            recordType: 'TotalCaloriesBurned',
            timeRange: {
                operator: 'between',
                startTime: startTime.toISOString(),
                endTime: new Date().toISOString(),
            }
        });

        const totalCalories = response.records.reduce((sum, record) => sum + (record.energy as any)?.value, 0);
        return Math.round(totalCalories);

    } catch (error) {
        console.error("Error al leer las calorías de Health Connect:", error);
        return 0;
    }
};

export const HealthConnect = {
  isAvailable,
  requestPermissions,
  getSteps,
  getCalories,
};