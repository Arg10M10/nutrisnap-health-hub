import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import MacroProgressCircle from "./MacroProgressCircle";
import AnimatedNumber from "./AnimatedNumber";
import { cn } from "@/lib/utils";

interface CaloriesCardProps {
  current: number;
  goal: number;
  className?: string;
}

const CaloriesCard = ({ current, goal, className }: CaloriesCardProps) => {
  const { t } = useTranslation();
  const currentVal = current || 0;
  const goalVal = goal || 0;
  
  let percentage = goalVal > 0 ? (currentVal / goalVal) * 100 : 0;
  if (isNaN(percentage)) {
    percentage = 0;
  }

  const remaining = goalVal - currentVal;

  return (
    <Card className={cn("w-full flex flex-col justify-center shadow-sm border-none bg-card rounded-[2rem]", className)}>
      <CardContent className="flex items-center justify-between p-6 gap-4 h-full">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <p className="text-5xl font-black text-foreground">
              <AnimatedNumber value={currentVal} />
            </p>
            <span className="text-lg font-medium text-muted-foreground">kcal</span>
          </div>
          <p className="text-muted-foreground font-medium text-base">
            {remaining >= 0 ? (
              <>
                <span className="font-bold text-foreground"><AnimatedNumber value={remaining} /></span> {t('home.kcal_remaining', { count: remaining }).replace(String(remaining), '').replace('kcal', '').trim()}
              </>
            ) : (
              <>
                <span className="font-bold text-destructive"><AnimatedNumber value={Math.abs(remaining)} /></span> {t('home.kcal_over', { count: Math.abs(remaining) }).replace(String(Math.abs(remaining)), '').replace('kcal', '').trim()}
              </>
            )}
          </p>
        </div>
        <div className="w-24 h-24 relative flex-shrink-0">
          <MacroProgressCircle value={percentage} color="hsl(var(--primary))" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Flame className="w-8 h-8 text-primary fill-current" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaloriesCard;