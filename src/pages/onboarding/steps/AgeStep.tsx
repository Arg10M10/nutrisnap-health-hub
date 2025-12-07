import WheelPicker from '@/components/WheelPicker';
import { useTranslation } from 'react-i18next';

interface AgeStepProps {
  age: number | null;
  setAge: (age: number) => void;
}

export const AgeStep = ({ age, setAge }: AgeStepProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center">
        <WheelPicker
          min={13}
          max={100}
          value={age ?? 18} // Default to 18 if null
          onValueChange={setAge}
        />
        <span className="text-2xl text-muted-foreground font-semibold ml-2">{t('onboarding.age.unit')}</span>
      </div>
    </div>
  );
};