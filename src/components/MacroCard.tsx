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
    <Card className="p-3 flex flex-col items-center justify-center h-full gap-2 shadow-sm border-none bg-card rounded-[2rem]">
      <div className="w-14 h-14 relative flex-shrink-0">
        <MacroProgressCircle value={value} color={color} />
        <div className="absolute inset-0 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6">
          {icon}
        </div>
      </div>
      <div className="flex flex-col items-center w-full min-w-0">
        <p className="font-bold text-lg text-foreground leading-none">
          <AnimatedNumber value={currentVal} />
          <span className="text-xs ml-0.5 font-medium text-muted-foreground">{unit}</span>
        </p>
        <p className="text-xs text-muted-foreground font-medium mt-1 capitalize">{label.toLowerCase()}</p>
      </div>
    </Card>
  );
};

export default MacroCard;