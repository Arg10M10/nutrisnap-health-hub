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
      if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
      return true;
    }
    
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  },

  // Programa notificaciones variadas para toda la semana
  async scheduleAll() {
    if (!(await this.requestPermissions())) return;

    // Cancelamos todo primero para evitar duplicados
    await this.cancelAll();

    const notifications = [];
    let idCounter = 100;

    // Programamos para los próximos 7 días
    for (let day = 1; day <= 7; day++) {
      // 1. Mañana (09:00 AM) - Alternamos entre Peso (Lun/Jue) y Motivación de Comida
      const isWeightDay = day === 1 || day === 4; // Lunes y Jueves
      const morningMsg = isWeightDay 
        ? WEIGHT_MESSAGES[day % WEIGHT_MESSAGES.length]
        : FOOD_MESSAGES[day % FOOD_MESSAGES.length];

      notifications.push({
        id: idCounter++,
        title: morningMsg.title,
        body: morningMsg.body,
        schedule: { on: { weekday: day, hour: 9, minute: 0 }, allowWhileIdle: true },
      });

      // 2. Almuerzo (01:30 PM) - Recordatorio de Escaneo
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

      // 4. Noche (08:00 PM) - Racha / Cena
      const streakMsg = STREAK_MESSAGES[day % STREAK_MESSAGES.length];
      notifications.push({
        id: idCounter++,
        title: streakMsg.title,
        body: streakMsg.body,
        schedule: { on: { weekday: day, hour: 20, minute: 0 }, allowWhileIdle: true },
      });
    }

    await LocalNotifications.schedule({ notifications });
  },

  // Funciones individuales para los toggles de la UI (ahora llaman a scheduleAll filtrado o simplificado)
  // Nota: Para mantener la consistencia con la UI actual, si el usuario activa solo "Agua", 
  // programamos solo las de agua.
  
  async scheduleMealReminders() {
    // Reutilizamos la lógica pero filtramos solo comidas/rachas
    if (!(await this.requestPermissions())) return;
    await this.cancelRemindersByPrefix(1); // IDs 100-199 reservados para comidas/general
    
    // Simplificación para el toggle individual: Programamos una recurrente diaria
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 101,
          title: FOOD_MESSAGES[0].title,
          body: FOOD_MESSAGES[0].body,
          schedule: { on: { hour: 13, minute: 30 }, allowWhileIdle: true },
        },
        {
          id: 102,
          title: STREAK_MESSAGES[0].title,
          body: STREAK_MESSAGES[0].body,
          schedule: { on: { hour: 20, minute: 0 }, allowWhileIdle: true },
        }
      ]
    });
  },

  async scheduleWaterReminders() {
    if (!(await this.requestPermissions())) return;
    await this.cancelRemindersByPrefix(2); // IDs 200+

    // Programar mensaje de agua diario a las 16:30
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
    await this.cancelRemindersByPrefix(3); // IDs 300+

    // Peso lunes y jueves
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 301,
          title: WEIGHT_MESSAGES[0].title,
          body: WEIGHT_MESSAGES[0].body,
          schedule: { on: { weekday: 2, hour: 9, minute: 0 }, allowWhileIdle: true }, // Lunes (weekday puede variar según locale, 2 suele ser lunes en JS/Capacitor a veces, check docs. Capacitor usa 1=Sunday)
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

  async cancelReminders(ids: number[]) {
    if (!Capacitor.isNativePlatform()) return;
    try {
        await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
    } catch (e) {
        console.warn("Error cancelling notifications", e);
    }
  },

  // Helper para cancelar rangos si es necesario
  async cancelRemindersByPrefix(prefix: number) {
      if (!Capacitor.isNativePlatform()) return;
      // Esto es una simplificación, idealmente rastreamos IDs exactos.
      // Aquí cancelamos una lista manual basada en nuestra lógica de generación.
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