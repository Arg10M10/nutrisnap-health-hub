import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedNumber from "./AnimatedNumber";
import { WaterSelectionDrawer } from "./WaterSelectionDrawer";

interface WaterTrackerCardProps {
  count: number;
  goal: number;
  onAdd: (amount: number) => void;
  onRemove: () => void;
  isUpdating: boolean;
}

const WaterTrackerCard = ({ count, goal, onAdd, onRemove, isUpdating }: WaterTrackerCardProps) => {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const percentage = Math.min((count / goal) * 100, 100);

  return (
    <>
      <Card className="relative overflow-hidden h-full flex flex-col justify-between group bg-card shadow-sm">
        <div 
          className="absolute bottom-0 left-0 right-0 bg-blue-50/80 dark:bg-blue-500/15 transition-all duration-700 ease-in-out z-0"
          style={{ height: `${percentage}%` }}
        />
        
        <div className="p-4 flex flex-col justify-between h-full z-10 relative gap-2">
          <div className="text-center pt-2">
            <div className="flex items-baseline justify-center gap-1.5">
              <p className="text-3xl font-bold text-foreground tabular-nums leading-none">
                <AnimatedNumber value={count} toFixed={0} />
              </p>
              <span className="text-xs text-muted-foreground font-medium">/ {goal}</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">
              {t('home.water_tracker_title', 'oz')}
            </p>
          </div>

          <div className="flex justify-center items-center gap-2 pb-1">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onRemove} 
              disabled={count === 0 || isUpdating}
              className="h-8 w-8 rounded-full border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-background/80 backdrop-blur-sm"
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <Button 
              size="sm" 
              onClick={() => setIsDrawerOpen(true)} 
              disabled={isUpdating}
              className="flex-1 h-8 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm transition-all active:scale-95 text-xs font-bold px-0"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> {t('common.add', 'Añadir')}
            </Button>
          </div>
        </div>
      </Card>

      <WaterSelectionDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onAdd={onAdd}
      />
    </>
  );
};

export default WaterTrackerCard;