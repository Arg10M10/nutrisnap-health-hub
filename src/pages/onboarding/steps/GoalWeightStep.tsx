import { NumberPicker } from '@/components/onboarding/NumberPicker';
import { useTranslation } from 'react-i18next';

interface GoalWeightStepProps {
  goalWeight: number | null;
  setGoalWeight: (weight: number) => void;
  currentWeight: number | null;
  units: 'metric' | 'imperial';
}

export const GoalWeightStep = ({ goalWeight, setGoalWeight, currentWeight, units }: GoalWeightStepProps) => {
  const { t } = useTranslation();
  const isMetric = units === 'metric';
  const initialValue = goalWeight || currentWeight || (isMetric ? 70 : 150);

  return (
    <div className="space-y-4">
      <NumberPicker
        label={t('onboarding.goal_weight.label')}
        unit={isMetric ? t('onboarding.metrics.kg') : t('onboarding.metrics.lbs')}
        value={goalWeight}
        onValueChange={setGoalWeight}
        min={isMetric ? 30 : 60}
        max={isMetric ? 200 : 450}
        displayFormatter={(val) => val.toFixed(1)}
        step={isMetric ? 0.5 : 1}
      />
      <p className="text-sm text-muted-foreground">
        {t('onboarding.goal_weight.disclaimer')}
      </p>
    </div>
  );
};