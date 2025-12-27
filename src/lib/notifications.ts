import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import i18n from './i18n';

// --- Banco de Mensajes Dinámico ---

const getBreakfastMessages = () => [
  { title: "🌅 " + i18n.t('notifications.breakfast_title', 'Buenos Días'), body: i18n.t('notifications.breakfast_body', 'Empieza tu día registrando tu desayuno.') },
  { title: "🍳 " + i18n.t('notifications.breakfast_title', 'Hora del Desayuno'), body: i18n.t('notifications.breakfast_body_2', '¿Qué hay de rico hoy? Regístralo.') },
];

const getSnackMessages = () => [
  { title: "🍎 " + i18n.t('notifications.snack_title', 'Pequeña Pausa'), body: i18n.t('notifications.snack_body', '¿Comiste algún snack? No olvides contarlo.') },
  { title: "🥛 " + i18n.t('notifications.snack_title', 'Hidratación'), body: i18n.t('notifications.water_body_1', 'Es buen momento para un vaso de agua.') },
];

const getLunchMessages = () => [
  { title: "🍽️ " + i18n.t('notifications.food_title'), body: i18n.t('notifications.food_body_1') },
  { title: "🥗 " + i18n.t('notifications.food_title_3'), body: i18n.t('notifications.food_body_3') },
];

const getDinnerMessages = () => [
  { title: "🌙 " + i18n.t('notifications.dinner_title_1'), body: i18n.t('notifications.dinner_body_1') },
  { title: "📝 " + i18n.t('notifications.dinner_title_2'), body: i18n.t('notifications.dinner_body_2') },
];

const getWaterMessages = () => [
  { title: "💧 " + i18n.t('notifications.water_title_1'), body: i18n.t('notifications.water_body_1') },
  { title: "🚰 " + i18n.t('notifications.water_title_2'), body: i18n.t('notifications.water_body_2') },
];

const getWeightMessages = () => [
  { title: "⚖️ " + i18n.t('notifications.weight_title_1'), body: i18n.t('notifications.weight_body_1') },
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

  // --- Programadores ---

  // Se expande a 3 veces al día: 08:00, 13:30, 20:00
  async scheduleMealReminders() {
    if (!(await this.requestPermissions())) return;
    await this.cancelMealReminders(); // Limpiar previos
    
    const breakfastMsgs = getBreakfastMessages();
    const lunchMsgs = getLunchMessages();
    const dinnerMsgs = getDinnerMessages();

    // Programamos recordatorios diarios
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 101, // Desayuno
          title: breakfastMsgs[0].title,
          body: breakfastMsgs[0].body,
          schedule: { on: { hour: 8, minute: 0 }, allowWhileIdle: true },
          channelId: 'calorel_reminders'
        },
        {
          id: 102, // Almuerzo
          title: lunchMsgs[0].title,
          body: lunchMsgs[0].body,
          schedule: { on: { hour: 13, minute: 30 }, allowWhileIdle: true },
          channelId: 'calorel_reminders'
        },
        {
          id: 103, // Cena
          title: dinnerMsgs[0].title,
          body: dinnerMsgs[0].body,
          schedule: { on: { hour: 20, minute: 0 }, allowWhileIdle: true },
          channelId: 'calorel_reminders'
        }
      ]
    });
  },

  // Se expande a 3 veces al día intercaladas: 10:30, 16:00, 18:30
  async scheduleWaterReminders() {
    if (!(await this.requestPermissions())) return;
    await this.cancelWaterReminders();

    const snackMsgs = getSnackMessages();
    const waterMsgs = getWaterMessages();

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 201, // Media mañana
          title: snackMsgs[1].title,
          body: snackMsgs[1].body,
          schedule: { on: { hour: 10, minute: 30 }, allowWhileIdle: true },
          channelId: 'calorel_reminders'
        },
        {
          id: 202, // Tarde temprano
          title: waterMsgs[0].title,
          body: waterMsgs[0].body,
          schedule: { on: { hour: 16, minute: 0 }, allowWhileIdle: true },
          channelId: 'calorel_reminders'
        },
        {
          id: 203, // Tarde noche
          title: waterMsgs[1].title,
          body: waterMsgs[1].body,
          schedule: { on: { hour: 18, minute: 30 }, allowWhileIdle: true },
          channelId: 'calorel_reminders'
        }
      ]
    });
  },

  // Mantenemos peso 2 veces por semana pero aseguramos el canal
  async scheduleWeightReminder() {
    if (!(await this.requestPermissions())) return;
    await this.cancelWeightReminders();

    const weightMsgs = getWeightMessages();

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 301,
          title: weightMsgs[0].title,
          body: weightMsgs[0].body,
          schedule: { on: { weekday: 2, hour: 9, minute: 0 }, allowWhileIdle: true }, // Lunes
          channelId: 'calorel_reminders'
        },
        {
          id: 302,
          title: weightMsgs[0].title,
          body: weightMsgs[0].body,
          schedule: { on: { weekday: 5, hour: 9, minute: 0 }, allowWhileIdle: true }, // Jueves
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