import { NumberPicker } from '@/components/onboarding/NumberPicker';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface MetricsStepProps {
  units: 'metric' | 'imperial';
  setUnits: (units: 'metric' | 'imperial') => void;
  weight: number | null;
  setWeight: (weight: number) => void;
  height: number | null;
  setHeight: (height: number) => void;
}

export const MetricsStep = ({ units, setUnits, weight, setWeight, height, setHeight }: MetricsStepProps) => {
  return (
    <div className="space-y-6">
      <ToggleGroup
        type="single"
        value={units}
        onValueChange={(value) => {
          if (value) setUnits(value as 'metric' | 'imperial');
        }}
        className="grid grid-cols-2"
      >
        <ToggleGroupItem value="metric" className="h-12 text-base">Metric (kg, cm)</ToggleGroupItem>
        <ToggleGroupItem value="imperial" className="h-12 text-base">Imperial (lbs, in)</ToggleGroupItem>
      </ToggleGroup>

      <div className="space-y-4">
        {units === 'metric' ? (
          <>
            <NumberPicker
              label="Height"
              unit="cm"
              value={height}
              onValueChange={setHeight}
              min={120}
              max={220}
            />
            <NumberPicker
              label="Weight"
              unit="kg"
              value={weight}
              onValueChange={setWeight}
              min={30}
              max={200}
            />
          </>
        ) : (
          <>
            <NumberPicker
              label="Height"
              unit="in"
              value={height}
              onValueChange={setHeight}
              min={47}
              max={86}
            />
            <NumberPicker
              label="Weight"
              unit="lbs"
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