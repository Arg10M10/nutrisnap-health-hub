import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// --- Banco de Mensajes ---

const FOOD_MESSAGES = [
  { title: '🍽️ Registro de comidas', body: '📸 Escanea tu comida y conoce sus calorías.' },
  { title: '🍽️ Tiempo récord', body: '⏱️ Solo toma 5 segundos registrar tu comida.' },
  { title: '🍽️ Hora de comer', body: '📸 ¿Qué hay en tu plato hoy? Escanéalo rápido.' },
];

const STREAK_MESSAGES = [
  { title: '🔥 ¡Salva tu racha!', body: '⚠️ No rompas tu racha, aún estás a tiempo hoy.' },
  { title: '🏆 Constancia', body: '🏆 Tu constancia está dando resultados. ¡Sigue así!' },
  { title: '💪 Casi lo logras', body: '💪 Un día más y subes de nivel. ¡Registra tu cena!' },
];

const WATER_MESSAGES = [
  { title: '💧 Hidratación', body: '💧 Hora de tomar un vaso de agua.' },
  { title: '🚰 Hábito saludable', body: '🚰 Mantente hidratado para mejores resultados.' },
  { title: '💦 Tu cuerpo', body: '💦 Tu cuerpo te lo agradecerá. Bebe un poco de agua.' },
];

const WEIGHT_MESSAGES = [
  { title: '⚖️ Control de peso', body: '⚖️ ¿Quieres actualizar tu peso hoy? Solo toma un momento.' },
  { title: '📊 Tu Progreso', body: '📊 Revisa tu progreso de esta semana.' },
  { title: '📈 Avanzando', body: '📈 Cada registro cuenta, sigue avanzando hacia tu meta.' },
];

// --- Gestor ---

export const NotificationManager = {
  async requestPermissions() {
    if (!Capacitor.isNativePlatform()) {
      if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
      return true;
    }
    
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  },

  // --- Programadores ---

  async scheduleMealReminders() {
    if (!(await this.requestPermissions())) return;
    await this.cancelMealReminders(); // Limpiar previos
    
    // Programamos recordatorios variados para la comida y la cena
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 101, // Almuerzo
          title: FOOD_MESSAGES[0].title,
          body: FOOD_MESSAGES[0].body,
          schedule: { on: { hour: 13, minute: 30 }, allowWhileIdle: true },
        },
        {
          id: 102, // Cena/Racha
          title: STREAK_MESSAGES[0].title,
          body: STREAK_MESSAGES[0].body,
          schedule: { on: { hour: 20, minute: 0 }, allowWhileIdle: true },
        }
      ]
    });
  },

  async scheduleWaterReminders() {
    if (!(await this.requestPermissions())) return;
    await this.cancelWaterReminders();

    // Mensaje de agua diario a las 16:30
    await LocalNotifications.schedule({
      notifications: [{
        id: 201,
        title: WATER_MESSAGES[0].title,
        body: WATER_MESSAGES[0].body,
        schedule: { on: { hour: 16, minute: 30 }, allowWhileIdle: true },
      }]
    });
  },

  async scheduleWeightReminder() {
    if (!(await this.requestPermissions())) return;
    await this.cancelWeightReminders();

    // Peso lunes y jueves
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 301,
          title: WEIGHT_MESSAGES[0].title,
          body: WEIGHT_MESSAGES[0].body,
          schedule: { on: { weekday: 2, hour: 9, minute: 0 }, allowWhileIdle: true }, // Lunes
        },
        {
          id: 302,
          title: WEIGHT_MESSAGES[2].title,
          body: WEIGHT_MESSAGES[2].body,
          schedule: { on: { weekday: 5, hour: 9, minute: 0 }, allowWhileIdle: true }, // Jueves
        }
      ]
    });
  },

  // --- Canceladores Específicos ---

  async cancelMealReminders() {
    // IDs 100-199 reservados para comidas
    await this.cancelRemindersByPrefix(1);
  },

  async cancelWaterReminders() {
    // IDs 200-299 reservados para agua
    await this.cancelRemindersByPrefix(2);
  },

  async cancelWeightReminders() {
    // IDs 300-399 reservados para peso
    await this.cancelRemindersByPrefix(3);
  },

  // --- Utilidades Internas ---

  async cancelReminders(ids: number[]) {
    if (!Capacitor.isNativePlatform()) return;
    try {
        await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
    } catch (e) {
        console.warn("Error cancelling notifications", e);
    }
  },

  async cancelRemindersByPrefix(prefix: number) {
      if (!Capacitor.isNativePlatform()) return;
      // Generamos un rango de IDs basado en el prefijo (ej. 1 -> 100 a 149)
      const ids = [];
      for(let i=0; i<50; i++) ids.push(prefix * 100 + i); 
      await this.cancelReminders(ids);
  },
  
  async cancelAll() {
      if (!Capacitor.isNativePlatform()) return;
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
  }
};