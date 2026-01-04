import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SettingsItemProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export const SettingsItem = ({ icon, label, onClick, destructive = false, disabled = false }: SettingsItemProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center justify-between text-left py-4 transition-colors rounded-md',
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : (destructive ? 'text-destructive hover:bg-destructive/10' : 'hover:bg-muted')
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn('flex items-center justify-center w-6', destructive && !disabled ? 'text-destructive' : 'text-primary')}>{icon}</div>
        <span className="font-medium text-foreground">{label}</span>
      </div>
      {!destructive && !disabled && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
    </button>
  );
};