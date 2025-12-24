import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import i18n from './i18n';

// --- Banco de Mensajes Dinámico ---

const getFoodMessages = () => [
  { title: i18n.t('notifications.food_title'), body: i18n.t('notifications.food_body_1') },
  { title: i18n.t('notifications.food_title'), body: i18n.t('notifications.food_body_2') },
  { title: i18n.t('notifications.food_title_3'), body: i18n.t('notifications.food_body_3') },
];

const getDinnerMessages = () => [
  { title: i18n.t('notifications.dinner_title_1'), body: i18n.t('notifications.dinner_body_1') },
  { title: i18n.t('notifications.dinner_title_2'), body: i18n.t('notifications.dinner_body_2') },
  { title: i18n.t('notifications.dinner_title_3'), body: i18n.t('notifications.dinner_body_3') },
];

const getWaterMessages = () => [
  { title: i18n.t('notifications.water_title_1'), body: i18n.t('notifications.water_body_1') },
  { title: i18n.t('notifications.water_title_2'), body: i18n.t('notifications.water_body_2') },
  { title: i18n.t('notifications.water_title_3'), body: i18n.t('notifications.water_body_3') },
];

const getWeightMessages = () => [
  { title: i18n.t('notifications.weight_title_1'), body: i18n.t('notifications.weight_body_1') },
  { title: i18n.t('notifications.weight_title_2'), body: i18n.t('notifications.weight_body_2') },
  { title: i18n.t('notifications.weight_title_3'), body: i18n.t('notifications.weight_body_3') },
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
    
    const foodMsgs = getFoodMessages();
    const dinnerMsgs = getDinnerMessages();

    // Programamos recordatorios variados para la comida y la cena
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 101, // Almuerzo
          title: foodMsgs[0].title,
          body: foodMsgs[0].body,
          schedule: { on: { hour: 13, minute: 30 }, allowWhileIdle: true },
        },
        {
          id: 102, // Cena
          title: dinnerMsgs[0].title,
          body: dinnerMsgs[0].body,
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

    const foodMsgs = getFoodMessages();
    const dinnerMsgs = getDinnerMessages();
    const waterMsgs = getWaterMessages();
    const weightMsgs = getWeightMessages();

    for (let day = 1; day <= 7; day++) {
      // 1. Mañana (09:00 AM) - Peso o Motivación
      const isWeightDay = day === 1 || day === 4; 
      const morningMsg = isWeightDay 
        ? weightMsgs[day % weightMsgs.length]
        : foodMsgs[day % foodMsgs.length];

      notifications.push({
        id: idCounter++,
        title: morningMsg.title,
        body: morningMsg.body,
        schedule: { on: { weekday: day, hour: 9, minute: 0 }, allowWhileIdle: true },
      });

      // 2. Almuerzo (01:30 PM)
      const lunchMsg = foodMsgs[(day + 1) % foodMsgs.length];
      notifications.push({
        id: idCounter++,
        title: lunchMsg.title,
        body: lunchMsg.body,
        schedule: { on: { weekday: day, hour: 13, minute: 30 }, allowWhileIdle: true },
      });

      // 3. Tarde (04:30 PM) - Agua
      const waterMsg = waterMsgs[day % waterMsgs.length];
      notifications.push({
        id: idCounter++,
        title: waterMsg.title,
        body: waterMsg.body,
        schedule: { on: { weekday: day, hour: 16, minute: 30 }, allowWhileIdle: true },
      });

      // 4. Noche (08:00 PM) - Cena (Reemplaza Rachas)
      const dinnerMsg = dinnerMsgs[day % dinnerMsgs.length];
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

    const waterMsgs = getWaterMessages();

    await LocalNotifications.schedule({
      notifications: [{
        id: 201,
        title: waterMsgs[0].title,
        body: waterMsgs[0].body,
        schedule: { on: { hour: 16, minute: 30 }, allowWhileIdle: true },
      }]
    });
  },

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
        },
        {
          id: 302,
          title: weightMsgs[2].title,
          body: weightMsgs[2].body,
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