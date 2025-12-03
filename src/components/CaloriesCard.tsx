import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import MacroProgressCircle from "./MacroProgressCircle";
import NumberSwitch from "./NumberSwitch";

interface CaloriesCardProps {
  current: number;
  goal: number;
}

const CaloriesCard = ({ current, goal }: CaloriesCardProps) => {
  const currentVal = current || 0;
  const goalVal = goal || 0;
  
  let percentage = goalVal > 0 ? (currentVal / goalVal) * 100 : 0;
  if (isNaN(percentage)) {
    percentage = 0;
  }

  const remaining = goalVal - currentVal;

  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-between h-full p-6">
        <div className="space-y-2">
          <div className="text-5xl font-bold text-foreground">
            <NumberSwitch number={currentVal.toFixed(0)} />
          </div>
          <p className="text-muted-foreground">
            {remaining >= 0 ? `${remaining.toFixed(0)} kcal restantes` : `${Math.abs(remaining).toFixed(0)} kcal sobre la meta`}
          </p>
        </div>
        <div className="w-24 h-24 relative">
          <MacroProgressCircle value={percentage} color="hsl(var(--primary))" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Flame className="w-8 h-8 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaloriesCard;