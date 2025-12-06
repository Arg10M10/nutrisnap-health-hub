import { NumberPicker } from '@/components/onboarding/NumberPicker';
import { useTranslation } from 'react-i18next';

interface AgeStepProps {
  age: number | null;
  setAge: (age: number) => void;
}

export const AgeStep = ({ age, setAge }: AgeStepProps) => {
  const { t } = useTranslation();
  return (
    <NumberPicker
      label={t('onboarding.age.label')}
      unit={t('onboarding.age.unit')}
      value={age}
      onValueChange={setAge}
      min={13}
      max={99}
    />
  );
};