import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GoalRowProps {
  icon: ReactNode;
  label: string;
  value: number;
  unit: string;
  onChange: (value: number) => void;
  color: string;
}

export const GoalRow = ({ icon, label, value, unit, onChange, color }: GoalRowProps) => {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', color)}>
          {icon}
        </div>
        <div>
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">{unit}</p>
        </div>
      </div>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        className="w-24 text-center text-lg font-semibold h-12"
      />
    </div>
  );
};