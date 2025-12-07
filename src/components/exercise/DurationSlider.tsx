import RulerPicker from '@/components/RulerPicker';
import { useTranslation } from 'react-i18next';

interface DurationSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

export const DurationSlider = ({ value, onValueChange }: DurationSliderProps) => {
  const { t } = useTranslation();
  return (
    <RulerPicker
      min={5}
      max={120}
      step={1}
      value={value}
      onValueChange={onValueChange}
      unit={t('running.minutes_unit')}
    />
  );
};