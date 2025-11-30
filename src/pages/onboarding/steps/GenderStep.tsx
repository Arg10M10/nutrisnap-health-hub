import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GenderStepProps {
  gender: string | null;
  setGender: (gender: string) => void;
}

export const GenderStep = ({ gender, setGender }: GenderStepProps) => {
  const genderOptions = ['Femenino', 'Masculino', 'Prefiero no decirlo'];

  return (
    <div className="space-y-4">
      {genderOptions.map((option) => (
        <Button
          key={option}
          variant="outline"
          size="lg"
          className={cn(
            'w-full h-14 text-lg justify-start p-6',
            gender === option && 'border-primary ring-2 ring-primary'
          )}
          onClick={() => setGender(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};