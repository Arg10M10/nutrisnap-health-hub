import { Card } from "@/components/ui/card";
import { Flame, Beef, Wheat, Droplets, Sparkles } from "lucide-react";

interface RecentAnalysisCardProps {
  imageUrl: string | null;
  foodName: string;
  time: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  sugars: number | null;
}

const RecentAnalysisCard = ({ imageUrl, foodName, time, calories, protein, carbs, fats, sugars }: RecentAnalysisCardProps) => {
  return (
    <Card className="p-4 flex items-center gap-4">
      <img src={imageUrl || '/placeholder.svg'} alt={foodName} className="w-20 h-20 rounded-lg object-cover" />
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-foreground">{foodName}</h4>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-primary" />
            <span>{calories ?? 0} kcal</span>
          </div>
          <div className="flex items-center gap-1">
            <Beef className="w-4 h-4 text-red-500" />
            <span>{protein ?? 0}g</span>
          </div>
          <div className="flex items-center gap-1">
            <Wheat className="w-4 h-4 text-orange-500" />
            <span>{carbs ?? 0}g</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span>{fats ?? 0}g</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>{sugars ?? 0}g</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RecentAnalysisCard;