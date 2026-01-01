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
      <div className="w-16 h-16 relative flex-shrink-0">
        <MacroProgressCircle value={value} color={color} />
        <div className="absolute inset-0 flex items-center justify-center [&>svg]:w-8 [&>svg]:h-8">
          {icon}
        </div>
      </div>
      <div className="flex flex-col items-center w-full min-w-0 overflow-hidden">
        <p className="font-black text-xl text-foreground leading-none truncate mt-1">
          <AnimatedNumber value={currentVal} />
          <span className="text-[10px] ml-0.5 font-bold text-muted-foreground/70">{unit}</span>
        </p>
        <p className="text-[10px] text-muted-foreground truncate w-full text-center uppercase tracking-wide font-bold mt-1">{label}</p>
      </div>
    </Card>
  );
};

export default MacroCard;