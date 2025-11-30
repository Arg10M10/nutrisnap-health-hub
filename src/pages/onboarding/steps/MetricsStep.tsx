import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MetricsStepProps {
  units: 'metric' | 'imperial';
  setUnits: (units: 'metric' | 'imperial') => void;
  weight: string;
  setWeight: (weight: string) => void;
  height: string;
  setHeight: (height: string) => void;
}

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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height" className="text-lg">Altura ({units === 'metric' ? 'cm' : 'in'})</Label>
          <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-14 text-lg text-center" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight" className="text-lg">Peso ({units === 'metric' ? 'kg' : 'lbs'})</Label>
          <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-14 text-lg text-center" />
        </div>
      </div>
    </div>
  );
};