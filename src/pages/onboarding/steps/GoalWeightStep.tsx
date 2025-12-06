import { NumberPicker } from '@/components/onboarding/NumberPicker';

interface GoalWeightStepProps {
  goalWeight: number | null;
  setGoalWeight: (weight: number) => void;
  currentWeight: number | null;
}

export const GoalWeightStep = ({ goalWeight, setGoalWeight, currentWeight }: GoalWeightStepProps) => {
  // Si no hay peso objetivo aún, sugerimos el peso actual como punto de partida
  const initialValue = goalWeight || currentWeight || 70;

  return (
    <div className="space-y-4">
      <NumberPicker
        label="Peso Objetivo"
        unit="kg"
        value={goalWeight}
        onValueChange={setGoalWeight}
        min={30}
        max={200}
        displayFormatter={(val) => val.toFixed(1)}
        step={0.5}
      />
      <p className="text-sm text-muted-foreground">
        Este será el objetivo que verás en tu gráfica de progreso.
      </p>
    </div>
  );
};