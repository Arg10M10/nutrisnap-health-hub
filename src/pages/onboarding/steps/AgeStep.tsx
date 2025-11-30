import { NumberPicker } from '@/components/onboarding/NumberPicker';

interface AgeStepProps {
  age: number | null;
  setAge: (age: number) => void;
}

export const AgeStep = ({ age, setAge }: AgeStepProps) => {
  return (
    <NumberPicker
      label="Tu edad"
      unit="años"
      value={age}
      onValueChange={setAge}
      min={13}
      max={99}
    />
  );
};