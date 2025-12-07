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
      unit={t('onboarding.age.unit')}
      value={age ?? 18}
      onValueChange={setAge}
      min={13}
      max={99}
      step={1}
    />
  );
};