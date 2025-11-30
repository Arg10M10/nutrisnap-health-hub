import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AgeStepProps {
  age: string;
  setAge: (age: string) => void;
}

export const AgeStep = ({ age, setAge }: AgeStepProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="age" className="text-lg">Tu edad</Label>
      <Input
        id="age"
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        placeholder="Ej: 25"
        className="h-14 text-lg text-center"
      />
    </div>
  );
};