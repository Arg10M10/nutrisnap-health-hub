import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame } from "lucide-react";

interface CaloriesCardProps {
  current: number;
  goal: number;
}

const CaloriesCard = ({ current, goal }: CaloriesCardProps) => {
  const percentage = goal > 0 ? (current / goal) * 100 : 0;

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-primary" />
            Calorías
          </span>
          <span className="text-sm text-muted-foreground">
            Meta: {goal}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-4xl font-bold text-foreground">{current.toFixed(0)} <span className="text-lg font-normal text-muted-foreground">kcal</span></p>
          <Progress value={percentage} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CaloriesCard;