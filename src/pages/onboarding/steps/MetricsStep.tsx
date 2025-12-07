import RulerPicker from '@/components/RulerPicker';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
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
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-center block">{t('onboarding.metrics.height')}</Label>
          <div className="flex items-baseline gap-2 justify-center">
            <Input
              type="number"
              value={height ?? ''}
              onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
              className="w-32 text-center text-2xl font-bold h-14"
            />
            <span className="text-lg text-muted-foreground">{units === 'metric' ? t('onboarding.metrics.cm') : 'in'}</span>
          </div>
        </div>
        
        <RulerPicker
          unit={units === 'metric' ? t('onboarding.metrics.kg') : t('onboarding.metrics.lbs')}
          value={weight ?? (units === 'metric' ? 70 : 154)}
          onValueChange={setWeight}
          min={units === 'metric' ? 30 : 60}
          max={units === 'metric' ? 200 : 450}
          step={units === 'metric' ? 0.1 : 1}
        />
      </div>
    </div>
  );
};