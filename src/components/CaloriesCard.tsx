import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import MacroProgressCircle from "./MacroProgressCircle";

interface CaloriesCardProps {
  current: number;
  goal: number;
}

const CaloriesCard = ({ current, goal }: CaloriesCardProps) => {
  const currentVal = current || 0;
  const goalVal = goal || 0;
  const percentage = goalVal > 0 ? (currentVal / goalVal) * 100 : 0;
  const remaining = goalVal - currentVal;

  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-between h-full p-6">
        <div className="space-y-2">
          <p className="text-5xl font-bold text-foreground">{currentVal.toFixed(0)}</p>
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