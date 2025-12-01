import { NumberPicker } from '@/components/onboarding/NumberPicker';

interface MetricsStepProps {
  weight: number | null;
  setWeight: (weight: number) => void;
  height: number | null;
  setHeight: (height: number) => void;
}

export const MetricsStep = ({ weight, setWeight, height, setHeight }: MetricsStepProps) => {
  return (
    <div className="space-y-4">
      <NumberPicker
        label="Altura"
        unit="cm"
        value={height}
        onValueChange={setHeight}
        min={120}
        max={220}
      />
      <NumberPicker
        label="Peso"
        unit="kg"
        value={weight}
        onValueChange={setWeight}
        min={30}
        max={200}
      />
    </div>
  );
};