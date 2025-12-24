import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// --- Banco de Mensajes ---

const FOOD_MESSAGES = [
  { title: '🍽️ Registro de comidas', body: '📸 Escanea tu comida y conoce sus calorías.' },
  { title: '🍽️ Tiempo récord', body: '⏱️ Solo toma 5 segundos registrar tu comida.' },
  { title: '🍽️ Hora de comer', body: '📸 ¿Qué hay en tu plato hoy? Escanéalo rápido.' },
];

const DINNER_MESSAGES = [
  { title: '🌙 Hora de la cena', body: '🍽️ No olvides registrar tu última comida del día.' },
  { title: '📝 Cierra tu día', body: '✅ Tómate un momento para registrar tu cena antes de descansar.' },
  { title: '🥗 Registro nocturno', body: '📸 ¿Qué cenaste hoy? Regístralo en segundos.' },
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
          id: 102, // Cena
          title: DINNER_MESSAGES[0].title,
          body: DINNER_MESSAGES[0].body,
          schedule: { on: { hour: 20, minute: 0 }, allowWhileIdle: true },
        }
      ]
    });
  },

  // Programa notificaciones variadas para toda la semana (llamado tras login/setup)
  async scheduleAll() {
    if (!(await this.requestPermissions())) return;
    await this.cancelAll();

    const notifications = [];
    let idCounter = 100;

    for (let day = 1; day <= 7; day++) {
      // 1. Mañana (09:00 AM) - Peso o Motivación
      const isWeightDay = day === 1 || day === 4; 
      const morningMsg = isWeightDay 
        ? WEIGHT_MESSAGES[day % WEIGHT_MESSAGES.length]
        : FOOD_MESSAGES[day % FOOD_MESSAGES.length];

      notifications.push({
        id: idCounter++,
        title: morningMsg.title,
        body: morningMsg.body,
        schedule: { on: { weekday: day, hour: 9, minute: 0 }, allowWhileIdle: true },
      });

      // 2. Almuerzo (01:30 PM)
      const lunchMsg = FOOD_MESSAGES[(day + 1) % FOOD_MESSAGES.length];
      notifications.push({
        id: idCounter++,
        title: lunchMsg.title,
        body: lunchMsg.body,
        schedule: { on: { weekday: day, hour: 13, minute: 30 }, allowWhileIdle: true },
      });

      // 3. Tarde (04:30 PM) - Agua
      const waterMsg = WATER_MESSAGES[day % WATER_MESSAGES.length];
      notifications.push({
        id: idCounter++,
        title: waterMsg.title,
        body: waterMsg.body,
        schedule: { on: { weekday: day, hour: 16, minute: 30 }, allowWhileIdle: true },
      });

      // 4. Noche (08:00 PM) - Cena (Reemplaza Rachas)
      const dinnerMsg = DINNER_MESSAGES[day % DINNER_MESSAGES.length];
      notifications.push({
        id: idCounter++,
        title: dinnerMsg.title,
        body: dinnerMsg.body,
        schedule: { on: { weekday: day, hour: 20, minute: 0 }, allowWhileIdle: true },
      });
    }

    await LocalNotifications.schedule({ notifications });
  },

  async scheduleWaterReminders() {
    if (!(await this.requestPermissions())) return;
    await this.cancelWaterReminders();

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

  // --- Canceladores ---

  async cancelMealReminders() {
    await this.cancelRemindersByPrefix(1);
  },

  async cancelWaterReminders() {
    await this.cancelRemindersByPrefix(2);
  },

  async cancelWeightReminders() {
    await this.cancelRemindersByPrefix(3);
  },

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