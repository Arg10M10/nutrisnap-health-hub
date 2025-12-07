import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import WheelPicker from '@/components/WheelPicker';
import DecimalWheelPicker from '@/components/DecimalWheelPicker';
import { useEffect } from 'react';

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

  // Set default values if null to enable continue button
  useEffect(() => {
    if (weight === null) {
      setWeight(units === 'metric' ? 70 : 150);
    }
    if (height === null) {
      setHeight(units === 'metric' ? 170 : 67);
    }
  }, []);

  const handleUnitChange = (newUnit: 'metric' | 'imperial') => {
    if (!newUnit || newUnit === units) return;

    if (weight !== null) {
      const newWeight = newUnit === 'imperial'
        ? parseFloat((weight * 2.20462).toFixed(1))
        : parseFloat((weight / 2.20462).toFixed(1));
      setWeight(newWeight);
    }

    if (height !== null) {
      const newHeight = newUnit === 'imperial'
        ? Math.round(height / 2.54) // cm to inches
        : Math.round(height * 2.54); // inches to cm
      setHeight(newHeight);
    }

    setUnits(newUnit);
  };

  const isMetric = units === 'metric';

  return (
    <div className="space-y-8">
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
        <div>
          <Label className="text-lg font-semibold text-center block mb-2">{t('onboarding.metrics.height')}</Label>
          <div className="flex items-center justify-center">
            <WheelPicker
              min={isMetric ? 100 : 40}
              max={isMetric ? 250 : 100}
              value={height}
              onValueChange={setHeight}
              className="w-24"
            />
            <span className="text-2xl text-muted-foreground font-semibold ml-2">{isMetric ? t('onboarding.metrics.cm') : 'in'}</span>
          </div>
        </div>
        <div>
          <Label className="text-lg font-semibold text-center block mb-2">{t('onboarding.metrics.weight')}</Label>
          <DecimalWheelPicker
            min={isMetric ? 30 : 60}
            max={isMetric ? 200 : 450}
            value={weight}
            onValueChange={setWeight}
            unit={isMetric ? t('onboarding.metrics.kg') : t('onboarding.metrics.lbs')}
          />
        </div>
      </div>
    </div>
  );
};