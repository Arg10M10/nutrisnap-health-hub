import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface GenderStepProps {
  gender: string | null;
  setGender: (gender: string) => void;
}

export const GenderStep = ({ gender, setGender }: GenderStepProps) => {
  const { t } = useTranslation();
  const genderOptions = [
    { id: 'Female', label: t('onboarding.gender.female') },
    { id: 'Male', label: t('onboarding.gender.male') },
    { id: 'Prefer not to say', label: t('onboarding.gender.not_say') },
  ];

  return (
    <div className="space-y-4">
      {genderOptions.map((option) => (
        <Button
          key={option.id}
          variant="outline"
          size="lg"
          className={cn(
            'w-full h-14 text-lg justify-start p-6',
            gender === option.id && 'border-primary ring-2 ring-primary'
          )}
          onClick={() => setGender(option.id)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};