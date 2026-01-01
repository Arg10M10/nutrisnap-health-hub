import { Card } from "@/components/ui/card";
import MacroProgressCircle from "@/components/MacroProgressCircle";
import AnimatedNumber from "./AnimatedNumber";

interface MacroCardProps {
  value: number;
  color: string;
  icon: React.ReactNode;
  current: number;
  unit: string;
  label: string;
}

const MacroCard = ({ value, color, icon, current, unit, label }: MacroCardProps) => {
  const currentVal = current || 0;

  return (
    <Card className="p-2 flex flex-col items-center justify-center h-full gap-1 shadow-sm">
      <div className="w-10 h-10 relative flex-shrink-0">
        <MacroProgressCircle value={value} color={color} />
        <div className="absolute inset-0 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
          {icon}
        </div>
      </div>
      <div className="flex flex-col items-center w-full min-w-0 overflow-hidden">
        <p className="font-bold text-lg text-foreground leading-none truncate">
          <AnimatedNumber value={currentVal} />
          <span className="text-xs ml-0.5">{unit}</span>
        </p>
        <p className="text-[10px] text-muted-foreground truncate w-full text-center uppercase tracking-wide">{label}</p>
      </div>
    </Card>
  );
};

export default MacroCard;