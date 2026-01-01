import { useState } from 'react';
import { Bell, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationManager } from '@/lib/notifications';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface NotificationsStepProps {
  onNext: () => void;
}

export const NotificationsStep = ({ onNext }: NotificationsStepProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      // 1. Pedir permisos explícitamente
      const granted = await NotificationManager.requestPermissions();
      
      if (granted) {
        // 2. Programar las notificaciones aleatorias cada 3 horas
        await NotificationManager.scheduleRandomReminders();

        // 3. Guardar estado en localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('settings_reminders_meals', 'true');
          window.localStorage.setItem('settings_reminders_water', 'true');
          window.localStorage.setItem('settings_reminders_weight', 'true');
        }

        setIsEnabled(true);
        toast.success(t('reminders.toast_enabled'));
        
        // Esperar un momento para que el usuario vea el cambio visual
        setTimeout(() => {
          onNext();
        }, 800);
      } else {
        toast.error(t('reminders.toast_denied'), {
          description: "Por favor, habilita las notificaciones en la configuración de tu teléfono."
        });
        setIsLoading(false); // Permitir reintentar
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error("Ocurrió un error al activar las notificaciones.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 w-full">
      <div className="relative">
        <motion.div 
          className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" 
          animate={isEnabled ? { scale: 2, opacity: 0 } : { scale: 1.5, opacity: 1 }}
        />
        <motion.div 
          className="relative bg-card p-8 rounded-full border-4 border-muted shadow-xl"
          animate={isEnabled ? { scale: 1.1, borderColor: "hsl(var(--primary))" } : {}}
        >
          {isEnabled ? (
            <CheckCircle2 className="w-16 h-16 text-primary fill-current" />
          ) : (
            <Bell className="w-16 h-16 text-primary fill-current" />
          )}
        </motion.div>
        
        {!isEnabled && (
          <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-background animate-bounce delay-1000">
            <ShieldCheck className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="text-center space-y-2 max-w-xs mx-auto">
        <h3 className="text-lg font-semibold">Recordatorios Inteligentes</h3>
        <p className="text-sm text-muted-foreground">
          Te enviaremos consejos y recordatorios cada 3 horas (9am - 9pm) para mantenerte enfocado.
        </p>
      </div>

      <div className="space-y-4 w-full">
        <Button 
          size="lg" 
          className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95" 
          onClick={handleEnable}
          disabled={isLoading || isEnabled}
        >
          {isEnabled ? "¡Activado!" : t('onboarding.notifications.enable_button')}
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