import { Slider } from '@/components/ui/slider';
import { useTranslation } from 'react-i18next';
import AnimatedNumber from '@/components/AnimatedNumber';
import { cn } from '@/lib/utils';

interface WeeklyRateStepProps {
  weeklyRate: number | null;
  setWeeklyRate: (rate: number) => void;
  units: 'metric' | 'imperial';
  goal: string | null;
}

export const WeeklyRateStep = ({ weeklyRate, setWeeklyRate, units, goal }: WeeklyRateStepProps) => {
  const { t } = useTranslation();
  const isMetric = units === 'metric';
  
  const min = isMetric ? 0.1 : 0.2;
  const max = isMetric ? 1.5 : 3.3;
  const step = 0.1;
  
  // Valores por defecto si viene null
  const safeRate = weeklyRate || (isMetric ? 0.5 : 1.1);

  const getLabel = () => {
    if (goal === 'gain_weight') return t('onboarding.weekly_rate.gain_label');
    return t('onboarding.weekly_rate.lose_label');
  };

  const unitLabel = isMetric ? 'kg' : 'lbs';

  return (
    <div className="space-y-12 py-4">
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-muted-foreground">{getLabel()}</p>
        <p className="text-6xl font-bold text-foreground">
          <AnimatedNumber value={safeRate} toFixed={1} /> 
          <span className="text-2xl font-semibold text-muted-foreground ml-2">{unitLabel}</span>
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <span className="text-4xl filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-110 cursor-pointer" onClick={() => setWeeklyRate(min)}>🐢</span>
          <span className="text-5xl filter grayscale-0 opacity-100 transform scale-110 cursor-pointer" onClick={() => setWeeklyRate(isMetric ? 0.5 : 1.1)}>🐇</span>
          <span className="text-4xl filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-110 cursor-pointer" onClick={() => setWeeklyRate(max)}>🐆</span>
        </div>

        <Slider
          value={[safeRate]}
          onValueChange={(vals) => setWeeklyRate(vals[0])}
          min={min}
          max={max}
          step={step}
          className="py-4"
        />

        <div className="flex justify-between text-sm font-medium text-muted-foreground px-1">
          <span>{min} {unitLabel}</span>
          <span className={cn(
            "transition-opacity duration-300",
            Math.abs(safeRate - (isMetric ? 0.5 : 1.1)) < 0.15 ? "opacity-100 text-primary font-bold" : "opacity-0"
          )}>
            {t('onboarding.weekly_rate.recommended')}
          </span>
          <span>{max} {unitLabel}</span>
        </div>
      </div>
      
      <div className="bg-primary/5 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {safeRate > (isMetric ? 1.0 : 2.2) 
            ? "Un ritmo rápido requiere mucha disciplina y cambios grandes." 
            : safeRate < (isMetric ? 0.3 : 0.6)
              ? "Un ritmo lento es más sostenible a largo plazo."
              : "Este es un ritmo equilibrado y saludable para la mayoría."
          }
        </p>
      </div>
    </div>
  );
};