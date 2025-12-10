import { Card } from "@/components/ui/card";
import { Footprints } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";
import MacroProgressCircle from "./MacroProgressCircle";

interface StepsCardProps {
  steps: number;
  goal: number;
}

const StepsCard = ({ steps, goal }: StepsCardProps) => {
  const percentage = goal > 0 ? (steps / goal) * 100 : 0;

  return (
    <Card className="h-full flex flex-col items-center justify-center p-4 text-center space-y-2">
      <div className="w-24 h-24 relative">
        <MacroProgressCircle value={percentage} color="hsl(var(--primary))" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Footprints className="w-10 h-10 text-primary" />
        </div>
      </div>
      <p className="text-4xl font-bold text-foreground">
        <AnimatedNumber value={steps} />
      </p>
      <p className="text-sm text-muted-foreground">Pasos Hoy</p>
    </Card>
  );
};

export default StepsCard;