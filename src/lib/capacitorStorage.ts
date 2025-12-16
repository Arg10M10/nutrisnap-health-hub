import { Preferences } from '@capacitor/preferences';

const CapacitorStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch (error) {
      console.warn('Error reading from native storage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.warn('Error writing to native storage:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.warn('Error removing from native storage:', error);
    }
  },
};

export default CapacitorStorage;