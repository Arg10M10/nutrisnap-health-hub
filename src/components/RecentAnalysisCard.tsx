import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Flame, Beef, Wheat, Droplets, Sparkles, Loader2, AlertTriangle, Wand2, FileText, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface RecentAnalysisCardProps {
  imageUrl: string | null;
  foodName: string;
  time: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  sugars: number | null;
  status: 'processing' | 'completed' | 'failed';
  reason: string | null;
  onClick: () => void;
  isMenu?: boolean;
}

const RecentAnalysisCard = ({ 
  imageUrl, 
  foodName, 
  time, 
  calories, 
  protein, 
  carbs, 
  fats, 
  sugars, 
  status, 
  reason, 
  onClick,
  isMenu = false 
}: RecentAnalysisCardProps) => {
  const { t } = useTranslation();
  const isProcessing = status === 'processing';
  const hasFailed = status === 'failed';
  const isClickable = status === 'completed';

  const [progress, setProgress] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isProcessing) {
      setProgress(10); // Empezar con algo de progreso visual inmediato
      
      // Actualizar mucho más rápido (cada 150ms en lugar de 500ms)
      timerRef.current = window.setInterval(() => {
        setProgress((p) => {
          // Incrementos más grandes al principio
          const increment = Math.random() * 5 + 1; 
          const next = p + increment;
          // Pausar visualmente al 90% esperando la respuesta real
          if (next > 90) return 90 + Math.random(); 
          return next;
        });
      }, 150);
    } else if (status === 'completed') {
      setProgress(100);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else if (hasFailed) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setProgress(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isProcessing, hasFailed, status]);

  return (
    <Card 
      className={cn("p-4 flex flex-row items-start gap-4 relative transition-colors overflow-hidden", isClickable && "cursor-pointer hover:bg-muted/50")} 
      onClick={isClickable ? onClick : undefined}
    >
      <div className="relative w-20 h-20 flex-shrink-0">
        <img src={imageUrl || '/placeholder.svg'} alt={foodName} className="w-20 h-20 rounded-lg object-cover" />
        {isProcessing && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center p-2 z-10">
             <Wand2 className="w-6 h-6 text-white animate-pulse mb-1" />
          </div>
        )}
        {hasFailed && (
          <div className="absolute inset-0 bg-red-900/60 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[5rem]">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h4 className="font-semibold text-foreground leading-tight">{foodName}</h4>
          <span className="text-xs text-muted-foreground flex-shrink-0 pt-0.5">{time}</span>
        </div>
        
        {isProcessing ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-primary font-medium animate-pulse">Analizando con IA...</span>
              <span className="font-bold text-foreground">{Math.floor(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : hasFailed ? (
          <p className="text-sm text-destructive font-medium leading-tight">{reason || 'Análisis fallido.'}</p>
        ) : isMenu ? (
          <div className="mt-1 flex items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold transition-colors group-hover:bg-primary/20">
              <FileText className="w-3.5 h-3.5" />
              {t('menu_analysis.view_result', 'Ver Resultados')}
              <ChevronRight className="w-3 h-3 ml-0.5 opacity-60" />
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium text-foreground">{calories ?? 0}</span>
            </div>
            <div className="w-px h-3 bg-border hidden sm:block" />
            <div className="flex items-center gap-1">
              <Beef className="w-3.5 h-3.5 text-red-500" />
              <span className="font-medium text-foreground">{protein ?? 0}g</span>
            </div>
            <div className="flex items-center gap-1">
              <Wheat className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-medium text-foreground">{carbs ?? 0}g</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium text-foreground">{fats ?? 0}g</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentAnalysisCard;