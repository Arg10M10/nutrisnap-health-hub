import { Slider } from '@/components/ui/slider';
import { useTranslation } from 'react-i18next';

interface DurationSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

export const DurationSlider = ({ value, onValueChange }: DurationSliderProps) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-muted-foreground">{t('running.duration')}</p>
        <p className="text-4xl font-bold text-foreground">{value} {t('running.minutes_unit')}</p>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onValueChange(vals[0])}
        min={5}
        max={120}
        step={5}
      />
    </div>
  );
};