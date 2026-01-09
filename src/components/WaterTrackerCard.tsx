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

  // Mismo path que en Water.tsx
  const glassPath = "M 5 0 H 235 L 210 300 Q 205 340 160 340 H 80 Q 35 340 30 300 L 5 0 Z";

  return (
    <Card 
      onClick={handleClick}
      className="relative overflow-hidden h-full flex items-center bg-card shadow-sm border-none rounded-[2rem] p-4 gap-6 cursor-pointer group hover:bg-muted/30 transition-colors"
    >
      {/* Columna Izquierda: Mini Vaso SVG */}
      <div className="relative w-20 h-28 flex-shrink-0" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 240 340" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            <clipPath id="glassClipSmall">
              <path d={glassPath} />
            </clipPath>
            <linearGradient id="glassGradientSmall" x1="120" y1="0" x2="120" y2="340" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" stopOpacity="0.4" />
              <stop offset="1" stopColor="white" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="liquidGradientSmall" x1="120" y1="0" x2="120" y2="340" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="1" stopColor="#3B82F6" />
            </linearGradient>
          </defs>

          {/* Vaso (Contenedor) */}
          <path 
            d={glassPath} 
            fill="url(#glassGradientSmall)" 
            stroke="rgba(255,255,255,0.6)" 
            strokeWidth="8" 
            className="drop-shadow-sm"
          />

          {/* Líquido */}
          <g clipPath="url(#glassClipSmall)">
            <rect 
              x="0" 
              y={340 - (340 * percentage / 100)} 
              width="240" 
              height="340" 
              fill="url(#liquidGradientSmall)" 
              className="transition-all duration-1000 ease-out"
              opacity="0.9"
            />
            
            {/* Superficie del líquido */}
            <rect 
              x="0" 
              y={340 - (340 * percentage / 100)} 
              width="240" 
              height="8" 
              fill="white" 
              fillOpacity="0.4"
              className="transition-all duration-1000 ease-out"
            />
          </g>

          {/* Brillo / Reflejo */}
          <path 
            d="M 20 10 Q 30 100 45 300" 
            stroke="white" 
            strokeWidth="8" 
            strokeOpacity="0.3" 
            strokeLinecap="round"
            fill="none"
            style={{ filter: 'blur(1px)' }}
          />
        </svg>
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