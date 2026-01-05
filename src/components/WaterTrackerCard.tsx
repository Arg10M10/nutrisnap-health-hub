import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedNumber from "./AnimatedNumber";
import { useNavigate } from "react-router-dom";

interface WaterTrackerCardProps {
  count: number;
  goal: number;
  onAdd: (amount: number) => void;
  onRemove: () => void;
  isUpdating: boolean;
}

const WaterTrackerCard = ({ count, goal, onAdd, onRemove, isUpdating }: WaterTrackerCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const percentage = Math.min((count / goal) * 100, 100);

  const handleAddClick = () => {
    navigate('/water');
  };

  return (
    <Card className="relative overflow-hidden h-full flex flex-col justify-between group bg-card shadow-sm border-none rounded-[2rem]">
      <div 
        className="absolute bottom-0 left-0 right-0 bg-blue-50/80 dark:bg-blue-500/15 transition-all duration-700 ease-in-out z-0"
        style={{ height: `${percentage}%` }}
      />
      
      <div className="p-4 flex flex-col justify-between h-full z-10 relative">
        <div className="text-center pt-2">
          <div className="flex items-baseline justify-center gap-1">
            <p className="text-4xl font-black text-foreground tabular-nums leading-none">
              <AnimatedNumber value={count} toFixed={0} />
            </p>
            <span className="text-sm text-muted-foreground font-medium">/ {goal}</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            {t('home.water_tracker_title', 'oz')}
          </p>
        </div>

        <div className="flex justify-center items-center gap-2 pb-1">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onRemove} 
            disabled={count === 0 || isUpdating}
            className="h-10 w-10 shrink-0 rounded-full border-transparent bg-background/50 hover:bg-background text-foreground shadow-sm"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <Button 
            size="icon" 
            onClick={handleAddClick} 
            disabled={isUpdating}
            className="h-10 w-10 shrink-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WaterTrackerCard;