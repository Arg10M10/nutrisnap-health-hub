import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Flame, Beef, Wheat, Droplets, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

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
  onClick: () => void;
}

const RecentAnalysisCard = ({ imageUrl, foodName, time, calories, protein, carbs, fats, sugars, status, onClick }: RecentAnalysisCardProps) => {
  const isProcessing = status === 'processing';
  const hasFailed = status === 'failed';
  const isClickable = status === 'completed';

  // Progreso simulado mientras la IA procesa
  const [progress, setProgress] = useState<number>(isProcessing ? 0 : 100);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Reiniciar segun status
    if (isProcessing) {
      setProgress(0);
      // Incrementos suaves hasta ~95% mientras llega el resultado real
      timerRef.current = window.setInterval(() => {
        setProgress((p) => {
          const next = p + Math.floor(Math.random() * 7) + 4; // +4..+10
          return Math.min(next, 95);
        });
      }, 500);
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
      className={cn("p-4 flex items-center gap-4 relative transition-colors", isClickable && "cursor-pointer hover:bg-muted/50")} 
      onClick={isClickable ? onClick : undefined}
    >
      <div className="relative w-20 h-20 flex-shrink-0">
        <img src={imageUrl || '/placeholder.svg'} alt={foodName} className="w-20 h-20 rounded-lg object-cover" />
        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center p-2">
            <div className="w-full">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
                <span className="text-white text-sm font-medium">Analizando...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-center mt-1 text-white text-xs font-semibold">{progress}%</div>
            </div>
          </div>
        )}
        {hasFailed && (
          <div className="absolute inset-0 bg-red-900/60 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-foreground">{foodName}</h4>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        {isProcessing ? (
          <div className="text-sm text-muted-foreground">
            La IA está calculando los nutrientes. Esto puede tardar unos segundos...
          </div>
        ) : hasFailed ? (
          <p className="text-sm text-destructive">El análisis ha fallado. Por favor, inténtalo de nuevo.</p>
        ) : (
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
        )}
      </div>
    </Card>
  );
};

export default RecentAnalysisCard;