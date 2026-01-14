import { Card } from "@/components/ui/card";
import { Flame, Dumbbell, Footprints, Bike, Wand2, AlertTriangle } from "lucide-react";
import { ExerciseEntry } from "@/context/NutritionContext";
import { useTranslation } from "react-i18next";

interface RecentExerciseCardProps {
  entry: ExerciseEntry;
}

const exerciseIcons: { [key: string]: React.ElementType } = {
  running: Footprints,
  cycling: Bike,
  weights: Dumbbell,
  manual: Dumbbell,
  default: Dumbbell,
};

const RecentExerciseCard = ({ entry }: RecentExerciseCardProps) => {
  const { t } = useTranslation();
  const isProcessing = entry.status === 'processing';
  const hasFailed = entry.status === 'failed';

  const Icon = exerciseIcons[entry.exercise_type] || exerciseIcons.default;

  return (
    <Card className="p-4 flex items-center gap-4 relative overflow-hidden">
      <div className="relative w-20 h-20 flex-shrink-0">
        <div className="w-full h-full bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-10 h-10 text-primary" />
        </div>
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
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-foreground truncate pr-2">
            {isProcessing ? (entry.description || t('analysis.analyzing_short')) : t(`exercise.${entry.exercise_type}` as any, { defaultValue: entry.exercise_type })}
          </h4>
          <span className="text-xs text-muted-foreground flex-shrink-0">{new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        
        {isProcessing ? (
          <div className="space-y-2">
            <p className="text-sm text-primary animate-pulse">{t('analysis.calculating_exercise')}</p>
          </div>
        ) : hasFailed ? (
          <p className="text-sm text-destructive font-medium">{t('analysis.failed')}</p>
        ) : (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="font-semibold text-destructive">{entry.calories_burned} kcal</span>
            </div>
            {entry.duration_minutes > 0 && <p>{entry.duration_minutes} min</p>}
            {entry.intensity !== 'manual' && <p className="capitalize">{t(`running.intensity_${entry.intensity}` as any)}</p>}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentExerciseCard;