import { NumberPicker } from '@/components/onboarding/NumberPicker';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MetricsStepProps {
  units: 'metric' | 'imperial';
  setUnits: (units: 'metric' | 'imperial') => void;
  weight: number | null;
  setWeight: (weight: number) => void;
  height: number | null;
  setHeight: (height: number) => void;
}

const formatHeightImperial = (totalInches: number): string => {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}' ${inches}"`;
};

export const MetricsStep = ({ units, setUnits, weight, setWeight, height, setHeight }: MetricsStepProps) => {
  return (
    <div className="space-y-6">
      <RadioGroup defaultValue="metric" onValueChange={(value) => setUnits(value as 'metric' | 'imperial')} className="flex justify-center gap-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="metric" id="metric" />
          <Label htmlFor="metric" className="text-lg">Métrico</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="imperial" id="imperial" />
          <Label htmlFor="imperial" className="text-lg">Imperial</Label>
        </div>
      </RadioGroup>

      <div className="space-y-4">
        <NumberPicker
          label="Altura"
          unit={units === 'metric' ? 'cm' : ''}
          value={height}
          onValueChange={setHeight}
          min={units === 'metric' ? 120 : 48}
          max={units === 'metric' ? 220 : 84}
          displayFormatter={units === 'imperial' ? formatHeightImperial : undefined}
        />
        <NumberPicker
          label="Peso"
          unit={units === 'metric' ? 'kg' : 'lbs'}
          value={weight}
          onValueChange={setWeight}
          min={units === 'metric' ? 30 : 65}
          max={units === 'metric' ? 200 : 440}
        />
      </div>
    </div>
  );
};