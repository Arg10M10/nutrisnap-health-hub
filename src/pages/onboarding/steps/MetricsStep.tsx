import { useState } from 'react';
import RulerPicker from '@/components/RulerPicker';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MetricsStepProps {
  units: 'metric' | 'imperial';
  setUnits: (units: 'metric' | 'imperial') => void;
  weight: number | null;
  setWeight: (weight: number) => void;
  height: number | null;
  setHeight: (height: number) => void;
}

export const MetricsStep = ({ units, setUnits, weight, setWeight, height, setHeight }: MetricsStepProps) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<'height' | 'weight' | null>(null);

  const handleUnitChange = (newUnit: 'metric' | 'imperial') => {
    if (!newUnit || newUnit === units) return;
    if (weight !== null) {
      const newWeight = newUnit === 'imperial' ? Math.round(weight * 2.20462) : Math.round(weight / 2.20462);
      setWeight(newWeight);
    }
    if (height !== null) {
      const newHeight = newUnit === 'imperial' ? Math.round(height / 2.54) : Math.round(height * 2.54);
      setHeight(newHeight);
    }
    setUnits(newUnit);
  };

  const heightUnit = units === 'metric' ? t('onboarding.metrics.cm') : 'in';
  const weightUnit = units === 'metric' ? t('onboarding.metrics.kg') : t('onboarding.metrics.lbs');

  if (editing) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={editing}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <Button variant="ghost" onClick={() => setEditing(null)} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a la selección
          </Button>
          {editing === 'height' && (
            <RulerPicker
              unit={heightUnit}
              value={height ?? (units === 'metric' ? 170 : 67)}
              onValueChange={setHeight}
              min={units === 'metric' ? 100 : 40}
              max={units === 'metric' ? 220 : 87}
              step={1}
            />
          )}
          {editing === 'weight' && (
            <RulerPicker
              unit={weightUnit}
              value={weight ?? (units === 'metric' ? 70 : 154)}
              onValueChange={setWeight}
              min={units === 'metric' ? 30 : 60}
              max={units === 'metric' ? 200 : 450}
              step={units === 'metric' ? 0.1 : 1}
            />
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="space-y-6">
      <ToggleGroup
        type="single"
        value={units}
        onValueChange={(value) => handleUnitChange(value as 'metric' | 'imperial')}
        className="grid grid-cols-2"
      >
        <ToggleGroupItem value="metric" className="h-12 text-base">{t('onboarding.metrics.metric')}</ToggleGroupItem>
        <ToggleGroupItem value="imperial" className="h-12 text-base">{t('onboarding.metrics.imperial')}</ToggleGroupItem>
      </ToggleGroup>

      <div className="space-y-4">
        <button
          onClick={() => setEditing('height')}
          className={cn(
            "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-left",
            height ? "border-primary bg-primary/5" : "border-muted hover:border-primary/30"
          )}
        >
          <div>
            <p className="font-semibold text-muted-foreground">{t('onboarding.metrics.height')}</p>
            <p className="text-2xl font-bold text-foreground">{height ? `${height} ${heightUnit}` : t('onboarding.select')}</p>
          </div>
          {height && <CheckCircle2 className="w-6 h-6 text-primary" />}
        </button>
        <button
          onClick={() => setEditing('weight')}
          className={cn(
            "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-left",
            weight ? "border-primary bg-primary/5" : "border-muted hover:border-primary/30"
          )}
        >
          <div>
            <p className="font-semibold text-muted-foreground">{t('onboarding.metrics.weight')}</p>
            <p className="text-2xl font-bold text-foreground">{weight ? `${weight} ${weightUnit}` : t('onboarding.select')}</p>
          </div>
          {weight && <CheckCircle2 className="w-6 h-6 text-primary" />}
        </button>
      </div>
    </div>
  );
};