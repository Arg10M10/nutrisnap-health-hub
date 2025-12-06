import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GoalStepProps {
  goal: string | null;
  setGoal: (goal: string) => void;
}

export const GoalStep = ({ goal, setGoal }: GoalStepProps) => {
  const { t } = useTranslation();
  const goals = [
    { id: 'lose_weight', label: t('onboarding.goal.lose_weight'), icon: <TrendingDown className="w-8 h-8" /> },
    { id: 'maintain_weight', label: t('onboarding.goal.maintain_weight'), icon: <Minus className="w-8 h-8" /> },
    { id: 'gain_weight', label: t('onboarding.goal.gain_weight'), icon: <TrendingUp className="w-8 h-8" /> },
  ];

  return (
    <div className="space-y-4">
      {goals.map((option) => (
        <Card
          key={option.id}
          className={cn(
            'p-6 flex items-center gap-4 cursor-pointer transition-all',
            goal === option.id ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50'
          )}
          onClick={() => setGoal(option.id)}
        >
          <div className="text-primary">{option.icon}</div>
          <span className="text-lg font-semibold">{option.label}</span>
        </Card>
      ))}
    </div>
  );
};