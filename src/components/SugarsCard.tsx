import { Card } from "@/components/ui/card";
import MacroProgressCircle from "@/components/MacroProgressCircle";
import { Candy } from "lucide-react";

interface SugarsCardProps {
  current: number;
  goal: number;
}

const SugarsCard = ({ current, goal }: SugarsCardProps) => {
  const currentVal = current || 0;
  const goalVal = goal || 0;
  const percentage = goalVal > 0 ? (currentVal / goalVal) * 100 : 0;
  const color = percentage > 100 ? "#ef4444" : "#a855f7";

  return (
    <Card className="p-4 text-center space-y-2 h-full flex flex-col justify-between">
      <div className="w-16 h-16 mx-auto relative">
        <MacroProgressCircle value={percentage} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Candy className="w-6 h-6 text-purple-500" />
        </div>
      </div>
      <p className="text-xl font-bold text-foreground">{currentVal.toFixed(0)}g</p>
      <p className="text-sm text-muted-foreground">Azúcares</p>
    </Card>
  );
};

export default SugarsCard;