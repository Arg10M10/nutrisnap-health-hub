import RulerPicker from '@/components/RulerPicker';
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
        <RulerPicker
          unit={isMetric ? t('onboarding.metrics.kg') : t('onboarding.metrics.lbs')}
          value={goalWeight ?? (isMetric ? 65 : 143)}
          onValueChange={setGoalWeight}
          min={isMetric ? 30 : 60}
          max={isMetric ? 200 : 450}
          step={isMetric ? 0.1 : 1}
        />
        <p className="text-sm text-muted-foreground text-center">
          {t('onboarding.goal_weight.disclaimer')}
        </p>
      </div>
    </div>
  );
};