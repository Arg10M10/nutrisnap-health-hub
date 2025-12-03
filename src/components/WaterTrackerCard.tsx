import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlassWater, Minus, Plus } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

interface WaterTrackerCardProps {
  count: number;
  goal: number;
  onAdd: () => void;
  onRemove: () => void;
  isUpdating: boolean;
}

const WaterTrackerCard = ({ count, goal, onAdd, onRemove, isUpdating }: WaterTrackerCardProps) => {
  return (
    <Card className="p-4 text-center space-y-2 h-full flex flex-col justify-between">
      <GlassWater className="w-10 h-10 mx-auto text-blue-500" />
      <div className="flex items-baseline justify-center gap-1">
        <p className="text-3xl font-bold text-foreground">
          <AnimatedNumber value={count} />
        </p>
        <p className="text-muted-foreground">/ {goal} vasos</p>
      </div>
      <div className="flex justify-center items-center gap-2">
        <Button variant="outline" size="icon" onClick={onRemove} disabled={count === 0 || isUpdating}>
          <Minus className="w-4 h-4" />
        </Button>
        <Button size="icon" onClick={onAdd} disabled={isUpdating}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default WaterTrackerCard;