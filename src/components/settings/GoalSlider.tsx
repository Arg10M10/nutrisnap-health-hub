import { Slider } from '@/components/ui/slider';
import AnimatedNumber from '@/components/AnimatedNumber';

interface GoalSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export const GoalSlider = ({ label, value, onValueChange, min, max, step, unit }: GoalSliderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-2xl font-bold text-primary">
          <AnimatedNumber value={value} />
          <span className="text-base font-medium text-muted-foreground ml-1">{unit}</span>
        </p>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onValueChange(vals[0])}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
};