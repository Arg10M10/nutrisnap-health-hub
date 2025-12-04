import { Card } from "@/components/ui/card";
import { Flame, Dumbbell, Footprints, Bike } from "lucide-react";
import { ExerciseEntry } from "@/context/NutritionContext";
import { useTranslation } from "react-i18next";

interface RecentExerciseCardProps {
  entry: ExerciseEntry;
}

const exerciseIcons: { [key: string]: React.ElementType } = {
  running: Footprints,
  cycling: Bike,
  weights: Dumbbell,
  default: Dumbbell,
};

const RecentExerciseCard = ({ entry }: RecentExerciseCardProps) => {
  const { t } = useTranslation();
  const Icon = exerciseIcons[entry.exercise_type] || exerciseIcons.default;

  return (
    <Card className="p-4 flex items-center gap-4 bg-primary/5 border-primary/20">
      <div className="w-20 h-20 flex-shrink-0 bg-primary/10 rounded-lg flex items-center justify-center">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-foreground capitalize">{t(`exercise.${entry.exercise_type}` as any)}</h4>
          <span className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-destructive" />
            <span className="font-semibold text-destructive">{entry.calories_burned} kcal</span>
          </div>
          <p>{entry.duration_minutes} min</p>
          <p className="capitalize">{t(`running.intensity_${entry.intensity}` as any)}</p>
        </div>
      </div>
    </Card>
  );
};

export default RecentExerciseCard;