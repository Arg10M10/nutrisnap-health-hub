import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from 'react-i18next';
import WheelPicker from '@/components/WheelPicker';
import { useEffect, useMemo } from 'react';

interface GoalWeightStepProps {
  goalWeight: number | null;
  setGoalWeight: (weight: number) => void;
  units: 'metric' | 'imperial';
  setUnits: (units: 'metric' | 'imperial') => void;
}

export const GoalWeightStep = ({ goalWeight, setGoalWeight, units, setUnits }: GoalWeightStepProps) => {
  const { t } = useTranslation();
  const isMetric = units === 'metric';

  // Set a default value if null
  useEffect(() => {
    if (goalWeight === null) {
      setGoalWeight(isMetric ? 65 : 143);
    }
  }, []);

  const handleUnitChange = (newUnit: 'metric' | 'imperial') => {
    if (!newUnit || newUnit === units) return;

    if (goalWeight !== null) {
      const newGoalWeight = newUnit === 'imperial'
        ? Math.round(goalWeight * 2.20462) // kg to lbs
        : Math.round(goalWeight / 2.20462); // lbs to kg
      setGoalWeight(newGoalWeight);
    }
    
    setUnits(newUnit);
  };

  const weightItems = useMemo(() => {
    const min = isMetric ? 30 : 66;
    const max = isMetric ? 200 : 440;
    return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  }, [isMetric]);

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
        <div className="flex items-center justify-center">
          <WheelPicker
            items={weightItems}
            value={goalWeight}
            onValueChange={setGoalWeight}
            className="w-24"
          />
          <span className="text-2xl text-muted-foreground font-semibold ml-2">{isMetric ? t('onboarding.metrics.kg') : t('onboarding.metrics.lbs')}</span>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {t('onboarding.goal_weight.disclaimer')}
        </p>
      </div>
    </div>
  );
};