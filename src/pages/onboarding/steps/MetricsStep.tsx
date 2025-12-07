import RulerPicker from '@/components/RulerPicker';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from 'react-i18next';

interface MetricsStepProps {
  units: 'metric' | 'imperial';
  setUnits: (units: 'metric' | 'imperial') => void;
  weight: number | null;
  setWeight: (weight: number) => void;
  height: number | null;
  setHeight: (height: number) => void;
}

export const MetricsStep = ({ units, setUnits, weight, setWeight, height, setHeight }: MetricsStepProps) => {
  const { t } = useTranslation();

  const handleUnitChange = (newUnit: 'metric' | 'imperial') => {
    if (!newUnit || newUnit === units) return;

    // Convert weight
    if (weight !== null) {
      const newWeight = newUnit === 'imperial'
        ? Math.round(weight * 2.20462) // kg to lbs
        : Math.round(weight / 2.20462); // lbs to kg
      setWeight(newWeight);
    }

    // Convert height
    if (height !== null) {
      const newHeight = newUnit === 'imperial'
        ? Math.round(height / 2.54) // cm to inches
        : Math.round(height * 2.54); // inches to cm
      setHeight(newHeight);
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

      <div className="space-y-8">
        {units === 'metric' ? (
          <>
            <RulerPicker
              unit={t('onboarding.metrics.cm')}
              value={height ?? 170}
              onValueChange={setHeight}
              min={120}
              max={220}
              step={1}
            />
            <RulerPicker
              unit={t('onboarding.metrics.kg')}
              value={weight ?? 70}
              onValueChange={setWeight}
              min={30}
              max={200}
              step={0.5}
            />
          </>
        ) : (
          <>
            <RulerPicker
              unit="in"
              value={height ?? 67}
              onValueChange={setHeight}
              min={47}
              max={86}
              step={1}
            />
            <RulerPicker
              unit={t('onboarding.metrics.lbs')}
              value={weight ?? 154}
              onValueChange={setWeight}
              min={60}
              max={450}
              step={1}
            />
          </>
        )}
      </div>
    </div>
  );
};