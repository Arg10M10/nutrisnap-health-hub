import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import AnimatedNumber from '../AnimatedNumber';

interface GoalInputProps {
  label: string;
  value: number;
  unit: string;
  onChange: (value: number) => void;
  color: string;
  size?: 'large' | 'small';
}

export const GoalInput = ({ label, value, unit, onChange, color, size = 'small' }: GoalInputProps) => {
  const isLarge = size === 'large';

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          'relative rounded-full border-4 flex flex-col items-center justify-center transition-colors',
          isLarge ? 'w-48 h-48' : 'w-32 h-32',
          color.replace('text-', 'border-')
        )}
      >
        <p className={cn('font-semibold', isLarge ? 'text-lg' : 'text-base', color)}>{label}</p>
        <p className={cn('font-bold text-foreground', isLarge ? 'text-4xl' : 'text-2xl')}>
          <AnimatedNumber value={value} />
        </p>
        <p className={cn('text-muted-foreground', isLarge ? 'text-base' : 'text-sm')}>{unit}</p>
      </div>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        className={cn('w-24 text-center text-lg font-semibold', isLarge && 'w-32 h-12')}
      />
    </div>
  );
};