import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { HealthConnect } from '@/integrations/health-connect/client';

interface HealthConnectStepProps {
  onContinue: () => void;
}

export const HealthConnectStep = ({ onContinue }: HealthConnectStepProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const granted = await HealthConnect.requestPermissions();
      if (granted) {
        toast.success(t('onboarding.health_connect.connect_success_title'), {
          description: t('onboarding.health_connect.connect_success_desc'),
        });
        // Aquí podrías obtener datos iniciales si fuera necesario
        // const steps = await HealthConnect.getSteps();
        // console.log(`Pasos iniciales: ${steps}`);
      } else {
        toast.info(t('onboarding.health_connect.permission_denied_title'), {
          description: t('onboarding.health_connect.permission_denied_desc'),
        });
      }
    } catch (error) {
      toast.error(t('onboarding.health_connect.connect_error_title'), {
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
      onContinue(); // Siempre continuar al siguiente paso
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <Zap className="w-12 h-12 text-primary" />
        </div>
      </div>
      <p className="text-muted-foreground">
        {t('onboarding.health_connect.description')}
      </p>
      <div className="!mt-8 space-y-3">
        <Button size="lg" className="w-full h-14 text-lg" onClick={handleConnect} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {t('onboarding.health_connect.connect_button')}
        </Button>
        <Button variant="ghost" onClick={onContinue} className="w-full" disabled={isLoading}>
          {t('onboarding.health_connect.skip')}
        </Button>
      </div>
    </div>
  );
};