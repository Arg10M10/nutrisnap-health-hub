import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// --- Message Bank (English only) ---

const getGeneralMessages = () => [
  { title: "💧 Hydration", body: "Your body needs water. Drink a glass!" },
  { title: "🍽️ Lunch Time", body: "What's for lunch? Log it now." },
  { title: "🍎 Snack Time", body: "Quick break, log your snack." },
  { title: "✨ Healthy Habit", body: "Stay hydrated for better results." },
  { title: "💪 Keep it up", body: "Consistency is the key to success." },
  { title: "📝 Log it", body: "Don't forget to log your meals today." },
  { title: "🎯 Calorel", body: "Have you completed your goals for today?" },
];

// --- Helpers ---

// Calculates the next date for a specific time
const getNextTime = (hour: number, minute: number = 0) => {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  // If the time has already passed today, schedule for tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next;
};

// --- Manager ---

export const NotificationManager = {
  async requestPermissions() {
    if (!Capacitor.isNativePlatform()) {
      console.log("Web platform: Notifications simulated.");
      return true;
    }
    
    try {
      const result = await LocalNotifications.requestPermissions();
      
      if (result.display === 'granted') {
        // Create high-importance channel for Android (CRITICAL for sound/pop-up)
        await LocalNotifications.createChannel({
          id: 'calorel_alerts',
          name: 'Calorel Alerts',
          description: 'Daily reminders',
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

  // --- New logic: 3-hour intervals ---

  async scheduleRandomReminders() {
    if (!(await this.requestPermissions())) return;
    
    // Cancel all previous to avoid duplicates
    await this.cancelAll();

    const messages = getGeneralMessages();
    const hours = [9, 12, 15, 18, 21]; // 9am, 12pm, 3pm, 6pm, 9pm (Approx every 3 hours)
    
    const notifications = hours.map((hour, index) => {
      // Choose a random message for this time slot (pseudo-random based on index to vary)
      // Use remainder of index + hour to rotate messages
      const msgIndex = (index + new Date().getDate()) % messages.length; 
      const msg = messages[msgIndex];

      return {
        id: 100 + index, // Unique IDs: 100, 101, 102...
        title: msg.title,
        body: msg.body,
        schedule: { 
          at: getNextTime(hour), 
          repeats: true, 
          every: 'day', 
          allowWhileIdle: true // Important for Android Doze mode
        },
        channelId: 'calorel_alerts',
        smallIcon: 'ic_stat_icon_config_sample', // Default Android icon
        sound: 'default'
      };
    });

    try {
      await LocalNotifications.schedule({ notifications });
      console.log(`Scheduled ${notifications.length} notifications every 3 hours.`);
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  },

  // --- Keep legacy methods for compatibility with Settings (redirect to new one) ---

  async scheduleMealReminders() {
    // Now part of the general scheduler
    await this.scheduleRandomReminders();
  },

  async scheduleWaterReminders() {
    // Now part of the general scheduler
    await this.scheduleRandomReminders();
  },

  async scheduleWeightReminder() {
    // Now part of the general scheduler
    await this.scheduleRandomReminders();
  },

  // --- Cancellers ---

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