import { useQuery } from "@tanstack/react-query";
import { HealthConnect } from "capacitor-health-connect";
import { Capacitor } from "@capacitor/core";
import { startOfDay, endOfDay, subDays } from "date-fns";
import useLocalStorage from "./useLocalStorage";

export const useHealthConnect = () => {
  const [isEnabled] = useLocalStorage('health_connect_enabled', false);
  const isAndroid = Capacitor.getPlatform() === 'android';
  
  const isConnected = isAndroid && isEnabled;

  const getDailyData = async (date: Date) => {
    if (!isConnected) return { steps: 0, calories: 0 };

    try {
      const startTime = startOfDay(date);
      const endTime = endOfDay(date);

      // Obtener pasos
      const stepsRes = await HealthConnect.getRecord({
        recordType: 'Steps',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      const steps = stepsRes.records.reduce((acc, record) => acc + record.count, 0);

      // Obtener calorías activas
      // Nota: ActiveCaloriesBurned a veces requiere permisos específicos o cálculo manual
      // Dependiendo de la fuente, a veces es mejor leer TotalCaloriesBurned y restar BMR, 
      // pero usaremos ActiveCaloriesBurned directo si está disponible.
      let calories = 0;
      try {
        const calRes = await HealthConnect.getRecord({
          recordType: 'ActiveCaloriesBurned',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        });
        calories = calRes.records.reduce((acc, record) => acc + (record.energy?.inKilocalories || 0), 0);
      } catch (e) {
        console.warn("Could not fetch active calories", e);
      }

      return { steps, calories: Math.round(calories) };
    } catch (error) {
      console.error("Health Connect Error:", error);
      return { steps: 0, calories: 0 };
    }
  };

  const getHistoryData = async (days: number) => {
    if (!isConnected) return [];

    const history = [];
    const today = new Date();

    // Hacemos las peticiones en paralelo para eficiencia
    const promises = Array.from({ length: days }).map(async (_, i) => {
      const date = subDays(today, (days - 1) - i); // Orden cronológico
      const data = await getDailyData(date);
      return {
        date,
        steps: data.steps,
        calories: data.calories
      };
    });

    return Promise.all(promises);
  };

  return {
    isConnected,
    getDailyData,
    getHistoryData
  };
};