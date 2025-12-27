import { useState } from 'react';
import { Bell, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationManager } from '@/lib/notifications';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface NotificationsStepProps {
  onNext: () => void;
}

export const NotificationsStep = ({ onNext }: NotificationsStepProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const granted = await NotificationManager.requestPermissions();
      if (granted) {
        // Programar todo por defecto
        await Promise.all([
          NotificationManager.scheduleMealReminders(),
          NotificationManager.scheduleWaterReminders(),
          NotificationManager.scheduleWeightReminder(),
        ]);

        // Guardar estado en localStorage para que la pantalla de Ajustes lo refleje
        // Nota: Usamos las mismas claves que en src/pages/settings/Reminders.tsx
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('settings_reminders_meals', 'true');
          window.localStorage.setItem('settings_reminders_water', 'true');
          window.localStorage.setItem('settings_reminders_weight', 'true');
        }

        toast.success(t('reminders.toast_enabled'));
      } else {
        toast.error(t('reminders.toast_denied'));
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
    } finally {
      setIsLoading(false);
      onNext();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 w-full">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
        <div className="relative bg-card p-8 rounded-full border-4 border-muted shadow-xl">
          <Bell className="w-16 h-16 text-primary fill-current" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-background">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-4 w-full">
        <Button 
          size="lg" 
          className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20" 
          onClick={handleEnable}
          disabled={isLoading}
        >
          {t('onboarding.notifications.enable_button')}
        </Button>
        
        <Button 
          variant="ghost" 
          size="lg" 
          className="w-full text-muted-foreground hover:bg-transparent" 
          onClick={onNext}
          disabled={isLoading}
        >
          {t('onboarding.notifications.skip_button')}
        </Button>
      </div>
    </div>
  );
};