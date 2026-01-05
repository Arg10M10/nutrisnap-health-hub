import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import AnimatedNumber from "./AnimatedNumber";

interface ActiveCaloriesCardProps {
  calories: number;
}

const ActiveCaloriesCard = ({ calories }: ActiveCaloriesCardProps) => {
  return (
    <Card className="p-3 flex flex-col items-center justify-center h-full gap-2 shadow-sm border-none bg-orange-50 dark:bg-orange-900/10 rounded-[2rem]">
      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-1">
        <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
      </div>
      <div className="flex flex-col items-center w-full min-w-0">
        <p className="font-bold text-xl text-orange-700 dark:text-orange-300 leading-none">
          <AnimatedNumber value={calories} />
        </p>
        <p className="text-[10px] text-orange-600/70 dark:text-orange-400/70 font-bold uppercase mt-1">
          Calorías Activas
        </p>
      </div>
    </Card>
  );
};

export default ActiveCaloriesCard;