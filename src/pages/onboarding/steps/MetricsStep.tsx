import { NumberPicker } from '@/components/onboarding/NumberPicker';
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

  const formatFeetAndInches = (totalInches: number) => {
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}.${inches.toString().padStart(2, '0')}`;
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
        {units === 'metric' ? (
          <>
            <NumberPicker
              label={t('onboarding.metrics.height')}
              unit={t('onboarding.metrics.cm')}
              value={height}
              onValueChange={setHeight}
              min={120}
              max={220}
            />
            <NumberPicker
              label={t('onboarding.metrics.weight')}
              unit={t('onboarding.metrics.kg')}
              value={weight}
              onValueChange={setWeight}
              min={30}
              max={200}
            />
          </>
        ) : (
          <>
            <NumberPicker
              label={t('onboarding.metrics.height')}
              unit={t('onboarding.metrics.ft')}
              value={height}
              onValueChange={setHeight}
              min={47} // 3'11" in inches
              max={86} // 7'2" in inches
              displayFormatter={formatFeetAndInches}
            />
            <NumberPicker
              label={t('onboarding.metrics.weight')}
              unit={t('onboarding.metrics.lbs')}
              value={weight}
              onValueChange={setWeight}
              min={60}
              max={450}
            />
          </>
        )}
      </div>
    </div>
  );
};