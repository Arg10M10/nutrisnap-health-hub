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

  const recommendedVal = isMetric ? 0.5 : 1.1;
  const slowThreshold = isMetric ? 0.3 : 0.6;
  const fastThreshold = isMetric ? 1.0 : 2.2;

  const isSlow = safeRate <= slowThreshold;
  const isFast = safeRate >= fastThreshold;
  const isMedium = !isSlow && !isFast;

  const getDescription = () => {
    if (isFast) return t('onboarding.weekly_rate.fast_desc');
    if (isSlow) return t('onboarding.weekly_rate.slow_desc');
    return t('onboarding.weekly_rate.balanced_desc');
  };

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
          <span 
            className={cn(
              "text-4xl transition-all duration-300 transform cursor-pointer",
              isSlow ? "filter-none opacity-100 scale-125" : "filter grayscale opacity-40 scale-100 hover:grayscale-0 hover:opacity-100 hover:scale-110"
            )} 
            onClick={() => setWeeklyRate(min)}
          >
            🐢
          </span>
          <span 
            className={cn(
              "text-5xl transition-all duration-300 transform cursor-pointer",
              isMedium ? "filter-none opacity-100 scale-125" : "filter grayscale opacity-40 scale-100 hover:grayscale-0 hover:opacity-100 hover:scale-110"
            )}
            onClick={() => setWeeklyRate(recommendedVal)}
          >
            🐇
          </span>
          <span 
            className={cn(
              "text-4xl transition-all duration-300 transform cursor-pointer",
              isFast ? "filter-none opacity-100 scale-125" : "filter grayscale opacity-40 scale-100 hover:grayscale-0 hover:opacity-100 hover:scale-110"
            )}
            onClick={() => setWeeklyRate(max)}
          >
            🐆
          </span>
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
            Math.abs(safeRate - recommendedVal) < 0.15 ? "opacity-100 text-primary font-bold" : "opacity-0"
          )}>
            {t('onboarding.weekly_rate.recommended')}
          </span>
          <span>{max} {unitLabel}</span>
        </div>
      </div>
      
      <div className="bg-primary/5 rounded-xl p-4 text-center transition-all duration-300">
        <p className="text-sm text-muted-foreground">
          {getDescription()}
        </p>
      </div>
    </div>
  );
};