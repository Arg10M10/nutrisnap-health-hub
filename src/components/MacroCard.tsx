import { Card } from "@/components/ui/card";
import MacroProgressCircle from "@/components/MacroProgressCircle";
import NumberSwitch from "./NumberSwitch";

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
    <Card className="p-4 text-center space-y-2 h-full flex flex-col justify-between">
      <div className="w-16 h-16 mx-auto relative">
        <MacroProgressCircle value={value} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">{icon}</div>
      </div>
      <div className="flex items-center justify-center gap-1 text-xl font-bold text-foreground">
        <NumberSwitch number={currentVal.toFixed(0)} />
        <span>{unit}</span>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
};

export default MacroCard;