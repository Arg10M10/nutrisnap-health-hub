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
    <Card className={cn("w-full flex flex-col justify-center shadow-sm", className)}>
      <CardContent className="flex items-center justify-between p-5 gap-4 h-full">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-5xl font-black text-foreground leading-none tracking-tight">
            <AnimatedNumber value={currentVal} />
          </p>
          <p className="text-muted-foreground font-medium text-base truncate">
            {remaining >= 0 ? (
              <>
                <AnimatedNumber value={remaining} /> {t('home.kcal_remaining', { count: remaining }).replace(String(remaining), '').trim()}
              </>
            ) : (
              <>
                <AnimatedNumber value={Math.abs(remaining)} /> {t('home.kcal_over', { count: Math.abs(remaining) }).replace(String(Math.abs(remaining)), '').trim()}
              </>
            )}
          </p>
        </div>
        <div className="w-24 h-24 relative flex-shrink-0">
          <MacroProgressCircle value={percentage} color="hsl(var(--primary))" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Flame className="w-10 h-10 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaloriesCard;