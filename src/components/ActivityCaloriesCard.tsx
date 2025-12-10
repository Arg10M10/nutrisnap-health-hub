import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

interface ActivityCaloriesCardProps {
  calories: number;
}

const ActivityCaloriesCard = ({ calories }: ActivityCaloriesCardProps) => {
  return (
    <Card className="h-full flex flex-col items-center justify-center p-4 text-center space-y-2">
      <Flame className="w-10 h-10 text-orange-500" />
      <p className="text-4xl font-bold text-foreground">
        <AnimatedNumber value={calories} />
      </p>
      <p className="text-sm text-muted-foreground">Calorías Activas</p>
    </Card>
  );
};

export default ActivityCaloriesCard;