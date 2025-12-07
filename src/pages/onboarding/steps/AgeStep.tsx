import { useEffect, useMemo } from 'react';
import WheelPicker from '@/components/WheelPicker';
import { useTranslation } from 'react-i18next';

interface AgeStepProps {
  age: number | null;
  setAge: (age: number) => void;
}

export const AgeStep = ({ age, setAge }: AgeStepProps) => {
  const { t } = useTranslation();
  const ageItems = useMemo(() => Array.from({ length: 100 - 13 + 1 }, (_, i) => i + 13), []);

  // If age is null, set a default value to enable the continue button.
  useEffect(() => {
    if (age === null) {
      setAge(18);
    }
  }, [age, setAge]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center">
        <WheelPicker
          items={ageItems}
          value={age ?? 18} // Keep providing a default for the picker's internal state
          onValueChange={setAge}
          className="w-24"
        />
        <span className="text-2xl text-muted-foreground font-semibold ml-2">{t('onboarding.age.unit')}</span>
      </div>
    </div>
  );
};