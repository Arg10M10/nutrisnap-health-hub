import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExperienceStepProps {
  experience: string | null;
  setExperience: (experience: string) => void;
}

export const ExperienceStep = ({ experience, setExperience }: ExperienceStepProps) => {
  const options = ['Sí, he usado varias', 'Sí, una o dos', 'No, esta es mi primera vez'];

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <Button
          key={option}
          variant="outline"
          size="lg"
          className={cn(
            'w-full h-auto min-h-14 text-lg text-wrap justify-start p-6',
            experience === option && 'border-primary ring-2 ring-primary'
          )}
          onClick={() => setExperience(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};