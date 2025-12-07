import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

interface AgeStepProps {
  age: number | null;
  setAge: (age: number) => void;
}

export const AgeStep = ({ age, setAge }: AgeStepProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-baseline gap-4 justify-center">
      <Input
        type="number"
        value={age ?? ''}
        onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
        className="w-32 text-center text-4xl font-bold h-20"
        autoFocus
      />
      <span className="text-2xl text-muted-foreground">{t('onboarding.age.unit')}</span>
    </div>
  );
};