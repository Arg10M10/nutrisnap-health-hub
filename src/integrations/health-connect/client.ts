import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

// Esto es una implementación simulada de un plugin de Health Connect.
// En un escenario real, instalarías un plugin de Capacitor
// y estas funciones llamarían a la API nativa de Health Connect de Android.

const isAvailable = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

/**
 * Simula la solicitud de permisos al usuario.
 * En una implementación real, esto abriría un diálogo nativo.
 */
const requestPermissions = async (): Promise<boolean> => {
  if (!isAvailable()) {
    toast.info("Health Connect no está disponible en esta plataforma.");
    console.log("Health Connect is not available on this platform.");
    // Devolvemos true para que el flujo continúe en web sin bloquear.
    return true;
  }

  // Simulamos la interacción del usuario con el diálogo de permisos.
  // Usamos un diálogo de confirmación para esta simulación.
  const granted = confirm(
    "Calorel quiere acceder a tus datos de Health Connect para leer tus pasos y calorías quemadas. ¿Permitir?"
  );

  if (granted) {
    console.log("Permisos de Health Connect concedidos (simulación).");
    return true;
  } else {
    console.log("Permisos de Health Connect denegados (simulación).");
    return false;
  }
};

/**
 * Simula la lectura del conteo de pasos de hoy.
 */
const getSteps = async (): Promise<number> => {
    if (!isAvailable()) return 0;
    // Devuelve un número aleatorio para la demostración.
    return Math.floor(Math.random() * 5000) + 1000;
};

/**
 * Simula la lectura de las calorías activas quemadas hoy.
 */
const getCalories = async (): Promise<number> => {
    if (!isAvailable()) return 0;
    // Devuelve un número aleatorio para la demostración.
    return Math.floor(Math.random() * 300) + 50;
};


export const HealthConnect = {
  isAvailable,
  requestPermissions,
  getSteps,
  getCalories,
};