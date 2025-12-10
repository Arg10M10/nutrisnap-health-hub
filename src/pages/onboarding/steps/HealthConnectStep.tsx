import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HealthConnectStepProps {
  onContinue: () => void;
}

export const HealthConnectStep = ({ onContinue }: HealthConnectStepProps) => {
  const { t } = useTranslation();

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
        <Button size="lg" className="w-full h-14 text-lg" onClick={onContinue}>
          {t('onboarding.health_connect.connect_button')}
        </Button>
        <Button variant="ghost" onClick={onContinue} className="w-full">
          {t('onboarding.health_connect.skip')}
        </Button>
      </div>
    </div>
  );
};