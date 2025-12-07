import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface MotivationStepProps {
  motivation: string | null;
  setMotivation: (motivation: string) => void;
}

export const MotivationStep = ({ motivation, setMotivation }: MotivationStepProps) => {
  const { t } = useTranslation();
  const options = [
    { id: 'healthier', label: t('onboarding.motivation.healthier') },
    { id: 'energy', label: t('onboarding.motivation.energy') },
    { id: 'motivated', label: t('onboarding.motivation.motivated') },
    { id: 'feel_better', label: t('onboarding.motivation.feel_better') },
  ];

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <Button
          key={option.id}
          variant="outline"
          size="lg"
          className={cn(
            'w-full h-auto min-h-14 text-lg text-wrap justify-start p-6',
            motivation === option.id && 'border-primary ring-2 ring-primary'
          )}
          onClick={() => setMotivation(option.id)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};