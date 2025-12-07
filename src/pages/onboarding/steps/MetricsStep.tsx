import RulerPicker from '@/components/RulerPicker';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';

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

    if (weight !== null) {
      const newWeight = newUnit === 'imperial'
        ? parseFloat((weight * 2.20462).toFixed(1))
        : parseFloat((weight / 2.20462).toFixed(1));
      setWeight(newWeight);
    }

    if (height !== null) {
      const newHeight = newUnit === 'imperial'
        ? Math.round(height / 2.54)
        : Math.round(height * 2.54);
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
          <Label className="text-lg font-semibold text-center block mb-4">{t('onboarding.metrics.height')}</Label>
          <RulerPicker
            unit={isMetric ? t('onboarding.metrics.cm') : 'in'}
            value={height ?? (isMetric ? 170 : 67)}
            onValueChange={setHeight}
            min={isMetric ? 100 : 40}
            max={isMetric ? 220 : 87}
            step={1}
          />
        </div>
        <div>
          <Label className="text-lg font-semibold text-center block mb-4">{t('onboarding.metrics.weight')}</Label>
          <RulerPicker
            unit={isMetric ? t('onboarding.metrics.kg') : t('onboarding.metrics.lbs')}
            value={weight ?? (isMetric ? 70 : 154)}
            onValueChange={setWeight}
            min={isMetric ? 30 : 60}
            max={isMetric ? 200 : 450}
            step={isMetric ? 0.1 : 1}
          />
        </div>
      </div>
    </div>
  );
};