import { Slider } from '@/components/ui/slider';

interface DurationSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

export const DurationSlider = ({ value, onValueChange }: DurationSliderProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-muted-foreground">Duración</p>
        <p className="text-4xl font-bold text-foreground">{value} min</p>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onValueChange(vals[0])}
        min={5}
        max={120}
        step={5}
      />
    </div>
  );
};