import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import i18n from './i18n';

// --- Helpers para Calcular Fechas Futuras ---

// Calcula la próxima fecha para una hora específica (hoy si no ha pasado, o mañana)
const getNextTime = (hour: number, minute: number) => {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  // Si la hora ya pasó hoy, programar para mañana
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next;
};

// Calcula la próxima fecha para un día de la semana específico (0=Domingo, 1=Lunes...)
const getNextDayOfWeek = (dayIndex: number, hour: number, minute: number) => {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  
  const currentDay = now.getDay();
  let diff = dayIndex - currentDay;
  
  // Si el día ya pasó esta semana, o es hoy pero la hora ya pasó, sumar 7 días
  if (diff < 0 || (diff === 0 && next <= now)) {
    diff += 7;
  }
  
  next.setDate(now.getDate() + diff);
  return next;
};

// --- Banco de Mensajes Dinámico ---

const getBreakfastMessages = () => [
  { title: "🌅 " + i18n.t('notifications.breakfast_title', 'Buenos Días'), body: i18n.t('notifications.breakfast_body', 'Empieza tu día registrando tu desayuno.') },
];

const getLunchMessages = () => [
  { title: "🍽️ " + i18n.t('notifications.food_title', 'Hora de Comer'), body: i18n.t('notifications.food_body_1', '¿Qué hay de rico hoy? Regístralo.') },
];

const getDinnerMessages = () => [
  { title: "🌙 " + i18n.t('notifications.dinner_title_1', 'Hora de Cenar'), body: i18n.t('notifications.dinner_body_1', 'No olvides registrar tu última comida.') },
];

const getSnackMessages = () => [
  { title: "🍎 " + i18n.t('notifications.snack_title', 'Snack Time'), body: i18n.t('notifications.snack_body', 'Pequeña pausa, registra tu snack.') },
  { title: "💧 " + i18n.t('notifications.water_title_1', 'Hidratación'), body: i18n.t('notifications.water_body_1', 'Es buen momento para un vaso de agua.') },
];

const getWaterMessages = () => [
  { title: "💧 " + i18n.t('notifications.water_title_1', 'Hidratación'), body: i18n.t('notifications.water_body_1', 'Tu cuerpo necesita agua. ¡Bebe un vaso!') },
  { title: "🚰 " + i18n.t('notifications.water_title_2', 'Hábito Saludable'), body: i18n.t('notifications.water_body_2', 'Mantente hidratado para mejores resultados.') },
];

const getWeightMessages = () => [
  { title: "⚖️ " + i18n.t('notifications.weight_title_1', 'Control de Peso'), body: i18n.t('notifications.weight_body_1', 'Actualiza tu peso hoy para ver tu progreso.') },
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
    
    try {
      const result = await LocalNotifications.requestPermissions();
      
      // Crear canal de alta importancia para Android
      await LocalNotifications.createChannel({
        id: 'calorel_reminders',
        name: 'Recordatorios Calorel',
        description: 'Recordatorios de comidas y hábitos',
        importance: 5, // High importance
        visibility: 1,
        vibration: true,
        sound: 'default' 
      });

      return result.display === 'granted';
    } catch (e) {
      console.error("Error requesting permissions", e);
      return false;
    }
  },

  // --- Programadores (Ahora usan 'at' + 'every' para evitar disparos inmediatos) ---

  async scheduleMealReminders() {
    if (!(await this.requestPermissions())) return;
    await this.cancelMealReminders(); // Limpiar previos
    
    const breakfastMsgs = getBreakfastMessages();
    const lunchMsgs = getLunchMessages();
    const dinnerMsgs = getDinnerMessages();

    // Usamos getNextTime para asegurar que sea en el futuro inmediato
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 101, // Desayuno (08:00)
          title: breakfastMsgs[0].title,
          body: breakfastMsgs[0].body,
          schedule: { at: getNextTime(8, 0), repeats: true, every: 'day', allowWhileIdle: true },
          channelId: 'calorel_reminders'
        },
        {
          id: 102, // Almuerzo (13:30)
          title: lunchMsgs[0].title,
          body: lunchMsgs[0].body,
          schedule: { at: getNextTime(13, 30), repeats: true, every: 'day', allowWhileIdle: true },
          channelId: 'calorel_reminders'
        },
        {
          id: 103, // Cena (20:00)
          title: dinnerMsgs[0].title,
          body: dinnerMsgs[0].body,
          schedule: { at: getNextTime(20, 0), repeats: true, every: 'day', allowWhileIdle: true },
          channelId: 'calorel_reminders'
        }
      ]
    });
  },

  async scheduleWaterReminders() {
    if (!(await this.requestPermissions())) return;
    await this.cancelWaterReminders();

    const snackMsgs = getSnackMessages();
    const waterMsgs = getWaterMessages();

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 201, // Media mañana (10:30)
          title: snackMsgs[1].title,
          body: snackMsgs[1].body,
          schedule: { at: getNextTime(10, 30), repeats: true, every: 'day', allowWhileIdle: true },
          channelId: 'calorel_reminders'
        },
        {
          id: 202, // Tarde temprano (16:00)
          title: waterMsgs[0].title,
          body: waterMsgs[0].body,
          schedule: { at: getNextTime(16, 0), repeats: true, every: 'day', allowWhileIdle: true },
          channelId: 'calorel_reminders'
        },
        {
          id: 203, // Tarde noche (18:30)
          title: waterMsgs[1].title,
          body: waterMsgs[1].body,
          schedule: { at: getNextTime(18, 30), repeats: true, every: 'day', allowWhileIdle: true },
          channelId: 'calorel_reminders'
        }
      ]
    });
  },

  async scheduleWeightReminder() {
    if (!(await this.requestPermissions())) return;
    await this.cancelWeightReminders();

    const weightMsgs = getWeightMessages();

    // Programar Lunes (1) y Jueves (4)
    // Usamos getNextDayOfWeek para calcular la fecha exacta del próximo lunes/jueves
    // y every: 'week' para que se repita semanalmente desde esa fecha.
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 301,
          title: weightMsgs[0].title,
          body: weightMsgs[0].body,
          schedule: { at: getNextDayOfWeek(1, 9, 0), repeats: true, every: 'week', allowWhileIdle: true }, // Lunes 9:00
          channelId: 'calorel_reminders'
        },
        {
          id: 302,
          title: weightMsgs[0].title,
          body: weightMsgs[0].body,
          schedule: { at: getNextDayOfWeek(4, 9, 0), repeats: true, every: 'week', allowWhileIdle: true }, // Jueves 9:00
          channelId: 'calorel_reminders'
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
      for(let i=0; i<10; i++) ids.push(prefix * 100 + i); 
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