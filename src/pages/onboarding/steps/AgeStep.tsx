import RulerPicker from '@/components/RulerPicker';
import { useTranslation } from 'react-i18next';

interface AgeStepProps {
  age: number | null;
  setAge: (age: number) => void;
}

export const AgeStep = ({ age, setAge }: AgeStepProps) => {
  const { t } = useTranslation();
  return (
    <RulerPicker
      min={13}
      max={100}
      step={1}
      value={age ?? 25}
      onValueChange={setAge}
      unit={t('onboarding.age.unit')}
    />
  );
};