import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

interface AgeStepProps {
  age: number | null;
  setAge: (age: number) => void;
}

export const AgeStep = ({ age, setAge }: AgeStepProps) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label htmlFor="age" className="text-lg font-semibold text-center block">{t('onboarding.age.label')}</Label>
      <div className="flex items-baseline gap-2 justify-center">
        <Input
          id="age"
          type="number"
          value={age ?? ''}
          onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
          className="w-32 text-center text-2xl font-bold h-14"
          autoFocus
        />
        <span className="text-lg text-muted-foreground">{t('onboarding.age.unit')}</span>
      </div>
    </div>
  );
};