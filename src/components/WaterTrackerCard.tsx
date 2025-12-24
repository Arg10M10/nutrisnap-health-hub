import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GlassWater, Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedNumber from "./AnimatedNumber";
import { WaterSelectionDrawer } from "./WaterSelectionDrawer";
import { cn } from "@/lib/utils";

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

  // Calcular porcentaje para visualización (tope en 100%)
  const percentage = Math.min((count / goal) * 100, 100);

  return (
    <>
      <Card className="relative overflow-hidden h-full flex flex-col justify-between group">
        {/* Fondo con efecto de llenado de agua */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-blue-50/50 transition-all duration-700 ease-in-out z-0"
          style={{ height: `${percentage}%` }}
        />
        
        <div className="p-4 flex flex-col justify-between h-full z-10 relative">
          <div className="text-center space-y-1">
            <div className="bg-blue-100/80 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-2 shadow-sm group-hover:scale-110 transition-transform">
              <GlassWater className="w-6 h-6" />
            </div>
            
            <div className="flex items-baseline justify-center gap-1">
              <p className="text-3xl font-bold text-foreground tabular-nums">
                <AnimatedNumber value={count} toFixed={1} />
              </p>
              <span className="text-sm text-muted-foreground">/ {goal}</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {t('home.water_tracker_title', 'Vasos')}
            </p>
          </div>

          <div className="flex justify-center items-center gap-2 mt-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onRemove} 
              disabled={count === 0 || isUpdating}
              className="h-9 w-9 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 bg-white/80 backdrop-blur-sm"
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <Button 
              size="sm" 
              onClick={() => setIsDrawerOpen(true)} 
              disabled={isUpdating}
              className="flex-1 h-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 mr-1" /> {t('common.add', 'Añadir')}
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