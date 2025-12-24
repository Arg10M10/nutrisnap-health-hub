import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const NotificationManager = {
  async requestPermissions() {
    if (!Capacitor.isNativePlatform()) {
        // Soporte básico para web si el navegador lo permite
        if (Notification.permission !== 'granted') {
            await Notification.requestPermission();
        }
        return true;
    }
    
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  },

  async scheduleMealReminders() {
    if (!(await this.requestPermissions())) return;

    // Cancelar recordatorios de comida existentes para no duplicar
    await this.cancelReminders([101, 102, 103]);

    const meals = [
      { id: 101, title: '🍎 Hora del Desayuno', body: 'No olvides registrar tu desayuno para empezar bien el día.', hour: 9, minute: 0 },
      { id: 102, title: '🥗 Hora del Almuerzo', body: 'Recarga energías y registra tu almuerzo.', hour: 13, minute: 30 },
      { id: 103, title: '🍲 Hora de la Cena', body: 'Cierra el día registrando tu cena.', hour: 20, minute: 0 },
    ];

    const notifications = meals.map(meal => ({
      title: meal.title,
      body: meal.body,
      id: meal.id,
      schedule: { 
        on: { hour: meal.hour, minute: meal.minute },
        allowWhileIdle: true 
      },
    }));

    await LocalNotifications.schedule({ notifications });
  },

  async scheduleWaterReminders() {
    if (!(await this.requestPermissions())) return;

    // IDs 200-205 para agua
    const waterIds = [200, 201, 202, 203, 204, 205];
    await this.cancelReminders(waterIds);

    // Programar cada 2 horas desde las 10am
    const times = [10, 12, 14, 16, 18, 20];
    
    const notifications = times.map((hour, index) => ({
      title: '💧 Hidratación',
      body: 'Es hora de beber un vaso de agua.',
      id: 200 + index,
      schedule: { 
        on: { hour: hour, minute: 0 },
        allowWhileIdle: true
      },
    }));

    await LocalNotifications.schedule({ notifications });
  },

  async scheduleWeightReminder() {
    if (!(await this.requestPermissions())) return;

    await this.cancelReminders([300]);

    await LocalNotifications.schedule({
      notifications: [{
        title: '⚖️ Control de Peso',
        body: 'Recuerda registrar tu peso esta mañana.',
        id: 300,
        schedule: { 
          on: { hour: 8, minute: 0 }, // 8:00 AM
          allowWhileIdle: true
        },
      }]
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
  
  async cancelAll() {
      if (!Capacitor.isNativePlatform()) return;
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
  }
};