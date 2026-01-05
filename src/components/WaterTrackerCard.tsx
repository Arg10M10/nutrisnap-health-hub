import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

const WaterTrackerCard = ({ count, goal, onAdd, isUpdating }: WaterTrackerCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const percentage = Math.min((count / goal) * 100, 100);

  const handleClick = () => {
    navigate('/water');
  };

  return (
    <Card 
      onClick={handleClick}
      className="relative overflow-hidden h-full flex items-center bg-card shadow-sm border-none rounded-[2rem] p-4 gap-6 cursor-pointer group hover:bg-muted/30 transition-colors"
    >
      {/* Columna Izquierda: Mini Vaso */}
      <div className="relative w-20 h-28 flex-shrink-0" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
        <div 
          className="absolute inset-0 z-10 overflow-hidden bg-blue-100/30 dark:bg-white/5 border-[3px] border-blue-200 dark:border-white/10"
          style={{
            borderRadius: '6px 6px 40px 40px',
            clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)' 
          }}
        >
            {/* Relleno Líquido */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-blue-400 dark:bg-blue-500 transition-all duration-700 ease-out"
              style={{
                height: `${percentage}%`,
                width: '100%',
                opacity: 0.9
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/40" />
            </div>
        </div>
      </div>
      
      {/* Columna Derecha: Info y Acción */}
      <div className="flex flex-col justify-center flex-1 gap-2">
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-black text-foreground tabular-nums leading-none">
              <AnimatedNumber value={count} toFixed={0} />
            </p>
            <span className="text-sm font-medium text-muted-foreground">/ {goal} oz</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            {t('home.log_water_title')}
          </p>
        </div>

        <Button 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation(); 
            navigate('/water');
          }} 
          disabled={isUpdating}
          className="w-full h-10 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-md gap-2 text-sm font-bold mt-1"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          {t('common.add')}
        </Button>
      </div>
    </Card>
  );
};

export default WaterTrackerCard;