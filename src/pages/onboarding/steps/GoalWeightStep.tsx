import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from 'react-i18next';

interface GoalWeightStepProps {
  goalWeight: number | null;
  setGoalWeight: (weight: number) => void;
  units: 'metric' | 'imperial';
  setUnits: (units: 'metric' | 'imperial') => void;
}

export const GoalWeightStep = ({ goalWeight, setGoalWeight, units, setUnits }: GoalWeightStepProps) => {
  const { t } = useTranslation();
  const isMetric = units === 'metric';

  const handleUnitChange = (newUnit: 'metric' | 'imperial') => {
    if (!newUnit || newUnit === units) return;

    if (goalWeight !== null) {
      const newGoalWeight = newUnit === 'imperial'
        ? parseFloat((goalWeight * 2.20462).toFixed(1)) // kg to lbs
        : parseFloat((goalWeight / 2.20462).toFixed(1)); // lbs to kg
      setGoalWeight(newGoalWeight);
    }
    
    setUnits(newUnit);
  };

  return (
    <div className="space-y-6">
      <ToggleGroup
        type="single"
        value={units}
        onValueChange={(value) => handleUnitChange(value as 'metric' | 'imperial')}
        className="grid grid-cols-2"
      >
        <ToggleGroupItem value="metric" className="h-12 text-base">{t('onboarding.metrics.metric')}</ToggleGroupItem>
        <ToggleGroupItem value="imperial" className="h-12 text-base">{t('onboarding.metrics.imperial')}</ToggleGroupItem>
      </ToggleGroup>
      <div className="space-y-4">
        <div className="flex items-baseline gap-2 justify-center">
            <Input
                type="number"
                step={isMetric ? "0.1" : "1"}
                value={goalWeight ?? ''}
                onChange={(e) => setGoalWeight(parseFloat(e.target.value) || 0)}
                className="w-40 text-center text-4xl font-bold h-20"
                autoFocus
            />
            <span className="text-2xl text-muted-foreground">{isMetric ? t('onboarding.metrics.kg') : t('onboarding.metrics.lbs')}</span>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {t('onboarding.goal_weight.disclaimer')}
        </p>
      </div>
    </div>
  );
};