import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { ReactNode } from 'react';

interface OnboardingOptionCardProps {
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  description: string;
}

export const OnboardingOptionCard = ({ selected, onClick, icon, label, description }: OnboardingOptionCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-left relative overflow-hidden",
      selected 
        ? "border-primary bg-primary/5 shadow-md" 
        : "border-muted hover:border-primary/30 bg-card"
    )}
  >
    <div className="flex items-center gap-4 z-10">
      <div className={cn("p-3 rounded-full flex-shrink-0", selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
        {icon}
      </div>
      <div>
        <p className={cn("font-bold text-lg", selected ? "text-primary" : "text-foreground")}>{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    {selected && (
      <div className="bg-primary text-white rounded-full p-1 z-10">
        <Check className="w-5 h-5" />
      </div>
    )}
  </button>
);