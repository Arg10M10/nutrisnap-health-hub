import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ExperienceStepProps {
  experience: string | null;
  setExperience: (experience: string) => void;
}

export const ExperienceStep = ({ experience, setExperience }: ExperienceStepProps) => {
  const { t } = useTranslation();
  const options = [
    { id: "Yes, I've used several", label: t('onboarding.experience.several') },
    { id: "Yes, one or two", label: t('onboarding.experience.one_or_two') },
    { id: "No, this is my first time", label: t('onboarding.experience.first_time') },
  ];

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <Button
          key={option.id}
          variant="outline"
          size="lg"
          className={cn(
            'w-full h-auto min-h-14 text-lg text-wrap justify-start p-6',
            experience === option.id && 'border-primary ring-2 ring-primary'
          )}
          onClick={() => setExperience(option.id)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};