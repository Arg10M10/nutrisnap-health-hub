import { Input } from '@/components/ui/input';
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
          <div className="flex items-baseline gap-2 justify-center">
            <Input
                type="number"
                value={height ?? ''}
                onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
                className="w-32 text-center text-2xl font-bold h-14"
            />
            <span className="text-lg text-muted-foreground">{isMetric ? t('onboarding.metrics.cm') : 'in'}</span>
          </div>
        </div>
        <div>
          <Label className="text-lg font-semibold text-center block mb-4">{t('onboarding.metrics.weight')}</Label>
          <div className="flex items-baseline gap-2 justify-center">
            <Input
                type="number"
                step={isMetric ? "0.1" : "1"}
                value={weight ?? ''}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-32 text-center text-2xl font-bold h-14"
            />
            <span className="text-lg text-muted-foreground">{isMetric ? t('onboarding.metrics.kg') : t('onboarding.metrics.lbs')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};