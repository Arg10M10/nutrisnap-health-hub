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
    <Card className="p-2 px-3 flex flex-row items-center justify-between h-full gap-2 shadow-sm">
      <div className="w-10 h-10 relative flex-shrink-0">
        <MacroProgressCircle value={value} color={color} />
        <div className="absolute inset-0 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
          {icon}
        </div>
      </div>
      <div className="flex flex-col items-end min-w-0 overflow-hidden">
        <p className="font-bold text-lg text-foreground leading-none truncate">
          <AnimatedNumber value={currentVal} />
          <span className="text-sm ml-0.5">{unit}</span>
        </p>
        <p className="text-xs text-muted-foreground truncate w-full text-right">{label}</p>
      </div>
    </Card>
  );
};

export default MacroCard;