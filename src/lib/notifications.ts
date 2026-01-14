import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import i18n from './i18n';

// --- Banco de Mensajes General (Mezclados) ---

const getGeneralMessages = () => [
  { title: "💧 " + i18n.t('notifications.water_title_1', 'Hidratación'), body: i18n.t('notifications.water_body_1', 'Tu cuerpo necesita agua. ¡Bebe un vaso!') },
  { title: "🍽️ " + i18n.t('notifications.food_title', 'Hora de Comer'), body: i18n.t('notifications.food_body_1', '¿Qué hay de rico hoy? Regístralo.') },
  { title: "🍎 " + i18n.t('notifications.snack_title', 'Snack Time'), body: i18n.t('notifications.snack_body', 'Pequeña pausa, registra tu snack.') },
  { title: "✨ " + i18n.t('notifications.water_title_2', 'Hábito Saludable'), body: i18n.t('notifications.water_body_2', 'Mantente hidratado para mejores resultados.') },
  { title: "💪 " + i18n.t('notifications.weight_title_1', 'Sigue así'), body: "La constancia es la clave del éxito." },
  { title: "📝 " + i18n.t('bottom_nav.log_title', 'Registrar'), body: "No olvides registrar tus comidas de hoy." },
  { title: "🎯 " + i18n.t('home.title', 'Calorel'), body: "¿Ya completaste tus metas de hoy?" },
];

// --- Helpers ---

// Calcula la próxima fecha para una hora específica
const getNextTime = (hour: number, minute: number = 0) => {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  // Si la hora ya pasó hoy, programar para mañana
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next;
};

// --- Gestor ---

export const NotificationManager = {
  async requestPermissions() {
    if (!Capacitor.isNativePlatform()) {
      console.log("Web platform: Notifications simulated.");
      return true;
    }
    
    try {
      const result = await LocalNotifications.requestPermissions();
      
      if (result.display === 'granted') {
        // Crear canal de alta importancia para Android (CRÍTICO para que suenen)
        await LocalNotifications.createChannel({
          id: 'calorel_alerts',
          name: 'Alertas Calorel',
          description: 'Recordatorios diarios',
          importance: 5, // 5 = High importance (pop-up)
          visibility: 1,
          vibration: true,
          sound: 'default_notification.mp3' 
        });
        return true;
      }
      
      return false;
    } catch (e) {
      console.error("Error requesting permissions", e);
      return false;
    }
  },

  // --- Nueva lógica: Intervalos de 3 horas ---

  async scheduleRandomReminders() {
    if (!(await this.requestPermissions())) return;
    
    // Cancelar todo lo anterior para evitar duplicados
    await this.cancelAll();

    const messages = getGeneralMessages();
    const hours = [9, 12, 15, 18, 21]; // 9am, 12pm, 3pm, 6pm, 9pm (Cada 3 horas aprox)
    
    const notifications = hours.map((hour, index) => {
      // Elegir un mensaje aleatorio para esta franja horaria (pseudo-aleatorio basado en índice para variar)
      // Usamos el resto del índice + hora para rotar mensajes
      const msgIndex = (index + new Date().getDate()) % messages.length; 
      const msg = messages[msgIndex];

      return {
        id: 100 + index, // IDs únicos: 100, 101, 102...
        title: msg.title,
        body: msg.body,
        schedule: { 
          at: getNextTime(hour), 
          repeats: true, 
          every: 'day', 
          allowWhileIdle: true // Importante para Android Doze mode
        },
        channelId: 'calorel_alerts',
        smallIcon: 'ic_stat_icon_config_sample', // Icono por defecto de Android
        sound: 'default'
      };
    });

    try {
      await LocalNotifications.schedule({ notifications });
      console.log(`Programadas ${notifications.length} notificaciones cada 3 horas.`);
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  },

  // --- Mantener métodos legacy para compatibilidad con Settings (redirigen al nuevo) ---

  async scheduleMealReminders() {
    // Ahora es parte del scheduler general
    await this.scheduleRandomReminders();
  },

  async scheduleWaterReminders() {
    // Ahora es parte del scheduler general
    await this.scheduleRandomReminders();
  },

  async scheduleWeightReminder() {
    // Ahora es parte del scheduler general
    await this.scheduleRandomReminders();
  },

  // --- Canceladores ---

  async cancelMealReminders() { await this.cancelAll(); },
  async cancelWaterReminders() { await this.cancelAll(); },
  async cancelWeightReminders() { await this.cancelAll(); },

  async cancelRemindersByPrefix(prefix: number) {
      // Legacy support
      await this.cancelAll();
  },
  
  async cancelAll() {
      if (!Capacitor.isNativePlatform()) return;
      try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel(pending);
        }
      } catch (e) {
        console.warn("Error cancelling notifications", e);
      }
  }
};